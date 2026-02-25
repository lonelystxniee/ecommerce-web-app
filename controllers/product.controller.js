const mongoose = require("mongoose");
const Product = require("../models/product");
const Category = require("../models/category");
// API thêm sản phẩm
exports.createProduct = async (req, res) => {
  try {
    const {
      productName,
      price,
      description,
      image,
      quantity,
      status,
      categoryID
    } = req.body;

    // Validate cơ bản
    if (!productName || price === undefined || !categoryID) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price must be >= 0" });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: "Quantity must be >= 0" });
    }

    // Validate categoryID phải là MongoDB ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(categoryID)) {
      return res.status(400).json({
        message: "categoryID không hợp lệ. Phải là MongoDB ObjectId (lấy từ _id của Category)"
      });
    }

    // Check category tồn tại
    const category = await Category.findById(categoryID);
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    // Tạo product
    const product = await Product.create({
      productName,
      price,
      description,
      image,
      quantity,
      status: status || "active",
      categoryID
    });

    res.status(201).json({
      message: "Product created successfully",
      productID: product._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// API lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// API lấy sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
// API update sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
//debounce in frontend
// API search sản phẩm
exports.searchProduct = async (req, res) => {
  try {
    const { query } = req.query;
    //Model.find(filter, projection, options)
    const products = await Product.find({
      productName: { $regex: query, $options: "i" }
    });
    res.json(products);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
