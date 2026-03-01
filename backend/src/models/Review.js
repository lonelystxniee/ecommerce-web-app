const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
    {
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        images: [
            {
                type: String, // Cloudinary URLs
            },
        ],
        videos: [
            {
                type: String, // Cloudinary URLs
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
