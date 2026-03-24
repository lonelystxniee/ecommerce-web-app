const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    summary: { type: String },
    content: { type: String }, // To hold HTML or detailed text
    image: { type: String },
    link: { type: String }, // For video links if they are stored here
    type: { type: String, enum: ["news", "video"], default: "news" },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["Hiện", "Ẩn"], default: "Hiện" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
