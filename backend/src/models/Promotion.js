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
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, default: "ACTIVE" }, // ACTIVE, EXPIRED, INACTIVE
  },
  { timestamps: true },
);

module.exports = mongoose.model("Promotion", PromotionSchema);
