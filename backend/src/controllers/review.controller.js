const Review = require("../models/Review");
const uploadToCloudinary = require("../../utils/uploadToCloudinary");

// Create or Update a review (Upsert)
exports.createReview = async (req, res) => {
    try {
        const { productID, rating, comment } = req.body;
        const userID = req.user._id;

        if (!productID || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin!" });
        }

        // Check if user already reviewed this product
        let review = await Review.findOne({ productID, userID });

        let imageUrls = review?.images || [];
        let videoUrls = review?.videos || [];

        // If new media files are uploaded, we replace the old ones (or could append, but replace is simpler for now)
        if (req.files && req.files.length > 0) {
            imageUrls = []; // Reset if new files uploaded
            videoUrls = [];
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer);
                if (file.mimetype.startsWith("video/")) {
                    videoUrls.push(result.secure_url);
                } else {
                    imageUrls.push(result.secure_url);
                }
            }
        }

        if (review) {
            // Update existing review
            review.rating = Number(rating);
            review.comment = comment;
            review.images = imageUrls;
            review.videos = videoUrls;
            await review.save();
            return res.status(200).json({ success: true, message: "Cập nhật đánh giá thành công!", review });
        } else {
            // Create new review
            review = await Review.create({
                productID,
                userID,
                rating: Number(rating),
                comment,
                images: imageUrls,
                videos: videoUrls,
            });
            return res.status(201).json({ success: true, message: "Đã gửi đánh giá thành công!", review });
        }
    } catch (error) {
        console.error("Create/Update review error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all reviews for a product (with pagination)
exports.getProductReviews = async (req, res) => {
    try {
        const { productID } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5; // Default 5 reviews per page
        const skip = (page - 1) * limit;

        const totalReviews = await Review.countDocuments({ productID });
        const totalPages = Math.ceil(totalReviews / limit);

        const reviews = await Review.find({ productID })
            .populate("userID", "fullName avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            reviews,
            pagination: {
                totalReviews,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get all reviews with pagination and search
exports.getAllReviewsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";

        let query = {};
        if (search) {
            // Can add search logic here if needed (e.g. searching by comment)
            query.comment = { $regex: search, $options: "i" };
        }

        const totalReviews = await Review.countDocuments(query);
        const reviews = await Review.find(query)
            .populate("userID", "fullName avatar email")
            .populate("productID", "productName images")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            reviews,
            pagination: {
                totalReviews,
                totalPages: Math.ceil(totalReviews / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Delete any review
exports.deleteReviewAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndDelete(id);
        if (!review) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá!" });
        }
        res.status(200).json({ success: true, message: "Đã xóa đánh giá thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
