const Category = require("../models/category");

// Tạo category mới
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Tên category là bắt buộc" });
        }

        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: "Category đã tồn tại" });
        }

        const category = await Category.create({ name, description });

        res.status(201).json({
            message: "Category created successfully",
            category
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Lấy tất cả categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
