const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { verifyToken: authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload.middleware");

const adminMiddleware = require("../middlewares/admin.middleware");

// Get all reviews for a product
router.get("/:productID", reviewController.getProductReviews);

// Admin: Get all reviews (Protected, Admin)
router.get("/", adminMiddleware, reviewController.getAllReviewsAdmin);

// Create a new review (Protected, User)
router.post(
    "/",
    adminMiddleware,
    upload.array("images", 10), // This will handle both images and videos
    reviewController.createReview
);

// Admin: Delete a review (Protected, Admin)
router.delete("/:id", adminMiddleware, reviewController.deleteReviewAdmin);

module.exports = router;
