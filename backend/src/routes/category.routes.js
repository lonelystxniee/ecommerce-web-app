const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const { verifyToken: authMiddleware } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/admin.middleware");

// GET /api/category - Lấy tất cả (public)
router.get("/", categoryController.getAllCategories);

// POST /api/category - Tạo mới (chỉ admin)
router.post("/", adminMiddleware, categoryController.createCategory);
//test
//router.post("/", categoryController.createCategory);
// PUT /api/category/:id - Cập nhật (chỉ admin)
router.put("/:id", adminMiddleware, categoryController.updateCategory);
// test
//router.put("/:id", categoryController.updateCategory);
// DELETE /api/category/:id - Xóa (chỉ admin)
router.delete("/:id", adminMiddleware, categoryController.deleteCategory);
// test
//router.delete("/:id", categoryController.deleteCategory);
module.exports = router;
