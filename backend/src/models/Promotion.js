const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true },
        description: String,
        discountType: { type: String, enum: ["PERCENT", "AMOUNT"], required: true }, // Giảm theo % hoặc số tiền cố định
        discountValue: { type: Number, required: true },
        minOrderValue: { type: Number, default: 0 }, // Giá trị đơn tối thiểu để áp dụng
        maxDiscount: { type: Number }, // Số tiền giảm tối đa (nếu là PERCENT)
        startDate: Date,
        endDate: Date,
        usageLimit: Number, // Tổng lượt sử dụng
        usedCount: { type: Number, default: 0 },
        status: { type: String, default: "ACTIVE" }, // ACTIVE, EXPIRED, INACTIVE

        // Banner & Popup fields
        isBannerActive: { type: Boolean, default: false },
        bannerText: String,
        bannerColor: { type: String, default: "linear-gradient(90deg, #FF416C 0%, #FF4B2B 100%)" },
        isPopupActive: { type: Boolean, default: false },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Promotion", PromotionSchema);
