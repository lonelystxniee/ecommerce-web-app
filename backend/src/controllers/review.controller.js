const Review = require("../models/Review");
const uploadToCloudinary = require("../../utils/uploadToCloudinary");
const activityController = require("./activityController");

// Create or Update a review (Upsert)
exports.createReview = async (req, res) => {
    try {
        let { productID, rating, comment } = req.body;
        const userID = req.user._id || req.user.id;

        if (!productID || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin!" });
        }

        // Clean productID - sometimes it comes as "id-VariantName", e.g. "69b...-Loại A", so we extract the ID part
        if (typeof productID === 'string' && productID.includes('-')) {
            productID = productID.split('-')[0];
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
        console.error("Create/Update review error FULL DETAILS:", error);
        if (error.stack) console.error(error.stack);
        res.status(500).json({ success: false, message: error.message, stack: error.stack });
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

        // Ghi log
        await activityController.createLog(req.user.id, "Xóa đánh giá", `Đã xóa đánh giá của người dùng ${review.userID} cho sản phẩm ${review.productID}`, req);

        res.status(200).json({ success: true, message: "Đã xóa đánh giá thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// User: Delete own review
exports.deleteReviewUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userID = req.user._id || req.user.id;

        const review = await Review.findOneAndDelete({ _id: id, userID });
        if (!review) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá hoặc bạn không có quyền xóa!" });
        }

        res.status(200).json({ success: true, message: "Đã xóa đánh giá thành công!" });
    } catch (error) {
        console.error("Delete user review error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const Order = require("../models/Order");

// Get all reviews submitted by the current user
exports.getUserReviews = async (req, res) => {
    try {
        const userID = req.user._id || req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalReviews = await Review.countDocuments({ userID });
        const reviews = await Review.find({ userID })
            .populate("productID", "productName images price")
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
        console.error("Get user reviews error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get pending reviews for the current user
exports.getPendingReviews = async (req, res) => {
    try {
        const userID = req.user._id || req.user.id;

        // 1. Get all reviews of the user to know what they already reviewed
        const userReviews = await Review.find({ userID }).select("productID");
        const reviewedProductIds = userReviews.map(r => r.productID.toString());

        // 2. Get all orders of the user that are DELIVERED or COMPLETED
        const orders = await Order.find({
            userId: userID,
            status: { $in: ["DELIVERED", "COMPLETED"] }
        }).select("items createdAt _id status");

        // 3. Extract unique products from these orders that haven't been reviewed
        let pendingProducts = [];
        let productMap = new Map();

        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    if (!item.id) return;

                    let productIdStr = item.id.toString();
                    // Extract base product ID if it has a variant attached
                    if (productIdStr.includes('-')) {
                        productIdStr = productIdStr.split('-')[0];
                    }

                    if (!reviewedProductIds.includes(productIdStr)) {
                        // Keep the latest order info for the product
                        if (!productMap.has(productIdStr)) {
                            productMap.set(productIdStr, {
                                productID: item.id, // Keep the original for frontend to render variant if needed
                                name: item.name,
                                image: item.image,
                                price: item.price,
                                orderId: order._id,
                                orderDate: order.createdAt
                            });
                        }
                    }
                });
            }
        });

        pendingProducts = Array.from(productMap.values());

        // Sort pending products by orderDate DESC
        pendingProducts.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        // Pagination for pending products
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const paginatedPending = pendingProducts.slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            pendingReviews: paginatedPending,
            pagination: {
                totalPending: pendingProducts.length,
                totalPages: Math.ceil(pendingProducts.length / limit),
                currentPage: page,
                limit
            }
        });

    } catch (error) {
        console.error("Get pending reviews error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
