const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    }, // Có thể null nếu khách không đăng nhập
    customerInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      address: { type: String, required: true },
      note: String,
    },
    items: [
      {
        id: String, // ID của sản phẩm (từ code cứng)
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    status: { type: String, default: "PENDING" }, // PENDING, CONFIRMED, DELIVERING, COMPLETED, CANCELLED
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);
