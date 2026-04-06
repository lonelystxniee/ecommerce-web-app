const express = require("express");
const router = express.Router();
const { getArticles, getArticleById, createArticle, updateArticle, deleteArticle } = require("../controllers/articleController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Public
router.get("/", getArticles);
router.get("/:id", getArticleById);

// Admin (protected)
router.post("/", verifyToken, createArticle);
router.put("/:id", verifyToken, updateArticle);
router.delete("/:id", verifyToken, deleteArticle);

module.exports = router;
