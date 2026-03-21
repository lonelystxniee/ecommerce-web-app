const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { verifyToken: authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload.middleware");

const adminMiddleware = require("../middlewares/admin.middleware");

// Get user's submitted reviews (Protected, User)
router.get("/my-reviews", authMiddleware, reviewController.getUserReviews);

// Get user's pending reviews (Protected, User)
router.get("/pending", authMiddleware, reviewController.getPendingReviews);

// Get all reviews for a product
router.get("/:productID", reviewController.getProductReviews);

// Admin: Get all reviews (Protected, Admin)
router.get("/", authMiddleware, adminMiddleware, reviewController.getAllReviewsAdmin);

// Create a new review (Protected, User)
router.post(
    "/",
    authMiddleware,
    upload.array("images", 10), // This will handle both images and videos
    reviewController.createReview
);

// Admin: Delete a review (Protected, Admin)
router.delete("/admin/:id", authMiddleware, adminMiddleware, reviewController.deleteReviewAdmin);

// User: Delete own review (Protected, User)
router.delete("/:id", authMiddleware, reviewController.deleteReviewUser);

module.exports = router;
