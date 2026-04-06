const mongoose = require("mongoose");
const Article = require("../models/Article");

// Get list of articles
exports.getArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    let dbQuery = {};
    if (req.query.type) dbQuery.type = req.query.type;
    if (req.query.status) dbQuery.status = req.query.status;

    let query = Article.find(dbQuery).sort({ [sortBy]: sortOrder });
    
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const articles = await query;
    res.status(200).json({ success: true, count: articles.length, articles });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get single article by ID
exports.getArticleById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }
    res.status(200).json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Create new article (Admin)
exports.createArticle = async (req, res) => {
  try {
    const { title, summary, content, image, link, type, date, status } = req.body;
    const article = new Article({
      title,
      summary,
      content,
      image,
      link,
      type: type || "news",
      date: date || new Date(),
      status: status || "Hiện"
    });
    const savedArticle = await article.save();
    res.status(201).json({ success: true, article: savedArticle });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update article (Admin)
exports.updateArticle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }
    res.status(200).json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete article (Admin)
exports.deleteArticle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
