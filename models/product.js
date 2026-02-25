const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true
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
        image: {
            type: String,
            default: ""
        },
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
        categoryID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
