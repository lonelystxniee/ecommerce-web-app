const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    customerInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      address: { type: String, required: true },
      note: String,
    },
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    status: { type: String, default: "PENDING" },
    promoCode: { type: String, default: null },
    trackingHistory: [
      {
        status: String,
        desc: String,
        time: { type: Date, default: Date.now },
      },
    ],
    ghnOrderCode: String,
    shipping: {
      shippingFee: { type: Number, default: 0 },
      shippingServiceId: { type: String },
      shippingServiceName: { type: String },
      shippingWeight: { type: Number },
      shippingDimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      shippingAddressStructured: {
        province: { id: Number, name: String, code: Number },
        district: { id: Number, name: String, code: Number },
        ward: { code: String, name: String },
        detail: String,
      },
      trackingCode: { type: String },
      shippingStatus: { type: String },
      shippingEvents: [
        {
          time: Date,
          status: String,
          note: String,
        },
      ],
      codAmount: { type: Number },
      shippingPaidBy: {
        type: String,
        enum: ["shop", "customer"],
        default: "customer",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);
