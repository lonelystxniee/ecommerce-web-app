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

// Bulk stock in logic
exports.bulkStockIn = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Danh sách hàng nhập không hợp lệ" });
    }

    const results = {
      updated: 0,
      created: 0,
      failed: 0,
      errors: []
    };

    for (const item of items) {
      try {
        let product = await Product.findOne({ productCode: item.productCode });

        if (product) {
          // Update existing product
          // If product has variants, we MUST update a variant
          if (product.variants && product.variants.length > 0) {
            let variant = item.variantLabel
              ? product.variants.find(v => v.label === item.variantLabel)
              : product.variants[0]; // If label not provided, default to first variant

            if (variant) {
              variant.stock = (variant.stock || 0) + (Number(item.quantity) || 0);
              if (item.price) variant.price = Number(item.price);
            } else if (item.variantLabel) {
              // Add new variant if label provided but not found
              product.variants.push({
                label: item.variantLabel,
                price: Number(item.price) || product.price,
                stock: Number(item.quantity) || 0
              });
            }
            // Sync total quantity
            product.quantity = product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
          } else {
            // Flat product update
            product.quantity += (Number(item.quantity) || 0);
            if (item.price) product.price = Number(item.price);
          }

          await product.save();
          results.updated++;
        } else {
          // Create new product
          if (!item.productName || !item.categoryID) {
            results.failed++;
            results.errors.push(`Sản phẩm ${item.productCode} chưa tồn tại, thiếu thông tin (Tên hoặc Danh mục)`);
            continue;
          }

          const productData = {
            productName: item.productName,
            productCode: item.productCode,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 0,
            categoryID: item.categoryID,
            description: item.description || "",
            slogan: item.slogan || "",
            variants: item.variantLabel ? [{
              label: item.variantLabel,
              price: Number(item.price) || 0,
              stock: Number(item.quantity) || 0
            }] : []
          };

          await Product.create(productData);
          results.created++;
        }
      } catch (err) {
        results.failed++;
        results.errors.push(`Lỗi khi xử lý mã ${item.productCode}: ${err.message}`);
      }
    }

    // Log activity
    await activityController.createLog(
      req.user.id,
      "Nhập kho hàng loạt",
      `Đã cập nhật ${results.updated} và tạo mới ${results.created} sản phẩm`,
      req
    );

    res.status(200).json({
      success: true,
      message: `Nhập kho hoàn tất: Cập nhật ${results.updated}, Tạo mới ${results.created}, Lỗi ${results.failed}`,
      results
    });

  } catch (error) {
    console.error("Bulk stock-in error:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi nhập kho", error: error.message });
  }
};

// Import warehouse stock from Excel/CSV (SKU + Quantity only)
exports.importWarehouseExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng tải lên file Excel!" });
    }

    // Parse the uploaded file buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    if (rows.length < 2) {
      return res.status(400).json({ success: false, message: "File không có dữ liệu (cần ít nhất 1 dòng dữ liệu ngoài tiêu đề)!" });
    }

    // Find SKU and Quantity column indices from header row
    const header = rows[0].map(h => String(h).toLowerCase().trim());
    const skuIdx = header.findIndex(h => h.includes("sku") || h.includes("mã") || h.includes("ma"));
    const qtyIdx = header.findIndex(h => h.includes("số lượng") || h.includes("so luong") || h.includes("quantity") || h.includes("sl"));

    if (skuIdx === -1 || qtyIdx === -1) {
      return res.status(400).json({
        success: false,
        message: `File thiếu cột yêu cầu! Cần cột "Mã sản phẩm (SKU)" và "Số lượng nhập". Header đọc được: ${rows[0].join(", ")}`
      });
    }

    const results = { updated: 0, failed: 0, errors: [], notFound: [] };
    const dataRows = rows.slice(1).filter(row => row[skuIdx] !== "");

    for (const row of dataRows) {
      const sku = String(row[skuIdx]).trim();
      const qty = parseInt(row[qtyIdx]) || 0;

      if (!sku) continue;
      if (qty <= 0) {
        results.failed++;
        results.errors.push(`${sku}: Số lượng nhập phải > 0 (đọc được: ${row[qtyIdx]})`);
        continue;
      }

      try {
        const product = await Product.findOne({ productCode: sku });
        if (!product) {
          results.failed++;
          results.notFound.push(sku);
          continue;
        }

        // Increment overall quantity
        product.quantity = (product.quantity || 0) + qty;

        // Also increment stock of first variant if it exists
        if (product.variants && product.variants.length > 0) {
          product.variants[0].stock = (product.variants[0].stock || 0) + qty;
        }

        await product.save();
        results.updated++;
      } catch (err) {
        results.failed++;
        results.errors.push(`${sku}: ${err.message}`);
      }
    }

    // Log activity
    await activityController.createLog(
      req.user.id,
      "Nhập kho qua Excel",
      `Đã cập nhật ${results.updated} sản phẩm từ file Excel. Lỗi: ${results.failed}`,
      req
    );

    let message = `✅ Đã cập nhật ${results.updated} sản phẩm thành công!`;
    if (results.notFound.length > 0) {
      message += ` ⚠️ Không tìm thấy ${results.notFound.length} mã: ${results.notFound.slice(0, 5).join(", ")}${results.notFound.length > 5 ? "..." : ""}`;
    }
    if (results.errors.length > 0) {
      message += ` ❌ ${results.failed} lỗi khác.`;
    }

    res.status(200).json({ success: true, message, results });

  } catch (error) {
    console.error("Import warehouse Excel error:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đọc file Excel", error: error.message });
  }
};

