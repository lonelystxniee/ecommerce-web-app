const User = require("../models/User");
const Product = require("../models/product");

exports.toggleWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Thiếu ID sản phẩm" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

        const index = user.wishlist.indexOf(productId);
        if (index === -1) {
            user.wishlist.push(productId);
            await user.save();
            return res.json({ success: true, message: "Đã thêm vào yêu thích", isFavorite: true });
        } else {
            user.wishlist.splice(index, 1);
            await user.save();
            return res.json({ success: true, message: "Đã xóa khỏi yêu thích", isFavorite: false });
        }
    } catch (error) {
        console.error("Wishlist toggle error:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate({
            path: "wishlist",
            populate: { path: "categoryID" }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

        res.json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        console.error("Get wishlist error:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
