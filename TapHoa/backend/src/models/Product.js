const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slogan: { type: String },
    category: { type: String, required: true },

    variants: [
      {
        label: String,
        price: Number,
        stock: Number,
      },
    ],

    images: [String],
    description: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", ProductSchema);
