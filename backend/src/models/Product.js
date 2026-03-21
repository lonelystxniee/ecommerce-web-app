const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    productCode: {
      type: String,
      required: true,
      unique: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      default: ""
    },
    images: [
      {
        type: String
      }
    ],
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    categoryID: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
      }
    ],
    slogan: {
      type: String,
      default: ""
    },
    variants: [
      {
        label: String, // e.g., "200g", "500g"
        price: Number,
        stock: Number
      }
    ]
  },
  { timestamps: true }
);

productSchema.index({
  productName: "text",
  description: "text"
});

module.exports = mongoose.model("Product", productSchema);
