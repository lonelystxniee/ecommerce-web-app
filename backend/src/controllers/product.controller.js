const mongoose = require("mongoose");
const Product = require("../models/product");
const Category = require("../models/category");
const uploadToCloudinary = require("../../utils/uploadToCloudinary");
const XLSX = require("xlsx");
const activityController = require("./activityController");

// Create product
exports.createProduct = async (req, res) => {
  try {
    let imageUrl = "";

    // 1️⃣ Check for productCode uniqueness
    const { productCode } = req.body;
    if (productCode) {
      const existingProduct = await Product.findOne({ productCode });
      if (existingProduct) {
        return res.status(400).json({ success: false, message: "Mã sản phẩm đã tồn tại!" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp mã sản phẩm!" });
    }

    // 2️⃣ Upload images if present
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        imageUrls.push(result.secure_url);
      }
    }

    // 3️⃣ Handle categories
    let categoryIds = [];
    if (req.body.categoryName) {
      const categoryNames = req.body.categoryName
        .split(",")
        .map(name => name.trim().toLowerCase());

      const categories = await Category.find();
      const categoryMap = {};

      categories.forEach(cat => {
        categoryMap[cat.name.trim().toLowerCase()] = cat._id;
      });

      for (let name of categoryNames) {
        if (categoryMap[name]) {
          categoryIds.push(categoryMap[name]);
        }
      }
    }

    // Default to at least one category if needed, or handle error
    if (categoryIds.length === 0 && !req.body.category) {
      // Fallback for case where frontend sends 'category' field
      const fallbackCat = await Category.findOne({ name: new RegExp(req.body.category || "o-mai", "i") });
      if (fallbackCat) categoryIds.push(fallbackCat._id);
    }

    // 4️⃣ Parse variants if present
    let variants = [];
    if (req.body.variants) {
      try {
        variants = typeof req.body.variants === 'string'
          ? JSON.parse(req.body.variants)
          : req.body.variants;
      } catch (e) {
        console.error("Error parsing variants:", e);
      }
    }

    const productData = {
      productName: req.body.name || req.body.productName,
      productCode,
      price: req.body.price || (variants[0]?.price || 0),
      description: req.body.description || "",
      images: imageUrls,
      quantity: req.body.quantity || (variants.reduce((acc, v) => acc + (v.stock || 0), 0) || 0),
      status: req.body.status || "active",
      categoryID: categoryIds,
      slogan: req.body.slogan || "",
      variants: variants
    };

    const product = await Product.create(productData);

    // Ghi log
    await activityController.createLog(req.user.id, "Tạo sản phẩm", `Đã tạo sản phẩm: ${productData.productName} (${productData.productCode})`, req);

    res.status(201).json({ success: true, product });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Import excel
exports.importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Fetch all existing categories once
    const existingCategories = await Category.find();
    const categoryMap = {};
    existingCategories.forEach(cat => {
      categoryMap[cat.name.trim().toLowerCase()] = cat._id;
    });

    const productsToInsert = [];
    const errors = [];
    const createdCategoryIds = new Set(); // To track newly created categories and avoid duplicates

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // Excel rows are 1-indexed, and header is row 1

      const productCode = row.productCode || row.sku || row.code;
      if (!productCode) {
        errors.push({ row: rowNumber, message: "Mã sản phẩm không được để trống." });
        continue;
      }

      // Check for existing productCode to prevent duplicates
      const existingProduct = await Product.findOne({ productCode });
      if (existingProduct) {
        errors.push({ row: rowNumber, message: `Mã sản phẩm '${productCode}' đã tồn tại.` });
        continue;
      }

      const categoryNames = row.categoryName
        ?.split(",")
        .map(name => name.trim().toLowerCase())
        .filter(name => name); // Filter out empty strings

      const categoryIds = [];

      if (categoryNames && categoryNames.length > 0) {
        for (let name of categoryNames) {
          if (categoryMap[name]) {
            categoryIds.push(categoryMap[name]);
          } else {
            // Category does not exist, create it
            try {
              const newCategory = await Category.create({ name: name });
              categoryMap[name] = newCategory._id; // Update map for future rows
              categoryIds.push(newCategory._id);
              createdCategoryIds.add(newCategory._id.toString()); // Track newly created
            } catch (catError) {
              // Handle potential duplicate category name if multiple rows try to create the same category concurrently
              if (catError.code === 11000) { // Duplicate key error
                const existingCat = await Category.findOne({ name: name });
                if (existingCat) {
                  categoryMap[name] = existingCat._id;
                  categoryIds.push(existingCat._id);
                } else {
                  errors.push({ row: rowNumber, message: `Lỗi tạo danh mục '${name}': ${catError.message}` });
                }
              } else {
                errors.push({ row: rowNumber, message: `Lỗi tạo danh mục '${name}': ${catError.message}` });
              }
            }
          }
        }
      }

      if (categoryIds.length === 0) {
        errors.push({ row: rowNumber, message: "Không tìm thấy hoặc tạo được danh mục cho sản phẩm." });
        continue;
      }

      productsToInsert.push({
        productName: row.productName || row.name,
        productCode: productCode,
        price: Number(row.price) || 0,
        description: row.description || "",
        images: row.image ? [row.image] : [],
        quantity: Number(row.quantity) || 0,
        status: row.status || "active",
        categoryID: categoryIds,
        slogan: row.slogan || ""
      });
    }

    let insertedProducts = [];
    let failedProductInserts = [];

    if (productsToInsert.length > 0) {
      try {
        insertedProducts = await Product.insertMany(productsToInsert, {
          ordered: false
        });
        // Ghi log nhập thành công
        await activityController.createLog(req.user.id, "Nhập Excel sản phẩm", `Đã nhập thành công ${insertedProducts.length} sản phẩm từ Excel`, req);
      } catch (insertError) {
        // Handle bulk insert errors (e.g., duplicate productCode if not caught earlier)
        if (insertError.writeErrors) {
          insertError.writeErrors.forEach(err => {
            const productData = productsToInsert[err.index];
            errors.push({
              row: rows.findIndex(r => (r.productCode || r.sku || r.code) === productData.productCode) + 2,
              message: `Lỗi khi thêm sản phẩm '${productData.productName}' (Mã: ${productData.productCode}): ${err.errmsg}`
            });
          });
        } else {
          errors.push({ message: `Lỗi không xác định khi thêm sản phẩm: ${insertError.message}` });
        }
        // Successfully inserted documents are in insertError.insertedDocs
        if (insertError.insertedDocs) {
          insertedProducts = insertError.insertedDocs;
        }
      }
    }

    res.status(201).json({
      success: true,
      totalRowsProcessed: rows.length,
      insertedCount: insertedProducts.length,
      failedCount: errors.length,
      errors: errors,
      createdCategoriesCount: createdCategoryIds.size
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all products (with pagination)
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find().populate("categoryID").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments()
    ]);

    const mappedProducts = products.map(p => ({
      ...p.toObject(),
      name: p.productName
    }));

    res.json({
      success: true,
      products: mappedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    // Ghi log
    await activityController.createLog(req.user.id, "Xóa sản phẩm", `Đã xóa sản phẩm: ${deleted.productName} (${deleted.productCode})`, req);

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("categoryID");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const result = { ...product.toObject(), name: product.productName };
    res.json({ success: true, product: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.name) {
      updateData.productName = updateData.name;
    }

    if (updateData.code || updateData.sku) {
      updateData.productCode = updateData.code || updateData.sku;
    }

    // 1️⃣ Upload new images if present
    if (req.files && req.files.length > 0) {
      let imageUrls = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        imageUrls.push(result.secure_url);
      }
      updateData.images = imageUrls;
    }

    // 2️⃣ Handle category
    if (req.body && req.body.categoryName) {
      const categoryNames = req.body.categoryName
        .split(",")
        .map(name => name.trim().toLowerCase());

      const categories = await Category.find();
      const categoryMap = {};

      categories.forEach(cat => {
        categoryMap[cat.name.trim().toLowerCase()] = cat._id;
      });

      const categoryIds = [];
      for (let name of categoryNames) {
        if (categoryMap[name]) {
          categoryIds.push(categoryMap[name]);
        }
      }
      if (categoryIds.length > 0) {
        updateData.categoryID = categoryIds;
      }
    }

    // 2️⃣ Handle variants
    if (req.body.variants) {
      try {
        updateData.variants = typeof req.body.variants === 'string'
          ? JSON.parse(req.body.variants)
          : req.body.variants;

        // Optionally update top-level price and quantity based on variants
        if (updateData.variants.length > 0) {
          updateData.price = updateData.variants[0].price;
          updateData.quantity = updateData.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
        }
      } catch (e) {
        console.error("Error parsing variants in update:", e);
      }
    }

    // 3️⃣ Update product
    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Ghi log
    await activityController.createLog(req.user.id, "Cập nhật sản phẩm", `Đã cập nhật sản phẩm: ${updated.productName} (${updated.productCode})`, req);

    res.json({ success: true, product: { ...updated.toObject(), name: updated.productName } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Search products with filters and pagination
exports.searchProduct = async (req, res) => {
  try {
    const { q, categoryId, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    let query = {};

    // Use MongoDB Text Search if keyword exists
    if (q) {
      query.$text = { $search: q };
    }

    // Filter by Category
    if (categoryId) {
      query.categoryID = categoryId;
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = {};
    if (q) {
      // If searching, sort by text score by default unless another sort is specified
      sortOptions = { score: { $meta: "textScore" } };
    } else {
      sortOptions = { createdAt: -1 };
    }

    if (sort === "price_asc") sortOptions = { price: 1 };
    if (sort === "price_desc") sortOptions = { price: -1 };
    if (sort === "newest") sortOptions = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query, q ? { score: { $meta: "textScore" } } : {})
      .populate("categoryID")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        totalProducts,
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tìm kiếm sản phẩm" });
  }
};