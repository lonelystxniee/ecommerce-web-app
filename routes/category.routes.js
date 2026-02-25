const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

// GET /api/category - Lấy tất cả (public)
router.get("/", categoryController.getAllCategories);

// POST /api/category - Tạo mới (chỉ admin)
router.post("/", authMiddleware, adminMiddleware, categoryController.createCategory);

// DELETE /api/category/:id - Xóa (chỉ admin)
router.delete("/:id", authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;
