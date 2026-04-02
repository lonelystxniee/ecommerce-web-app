const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "LOCAL";
      },
    },
    phone: { type: String, default: null },
    status: { type: String, enum: ["ACTIVE", "LOCKED"], default: "ACTIVE" },
    role: { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER" },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    refreshToken: { type: String, default: null },
    googleId: { type: String, default: null },
    authProvider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" },
    avatar: { type: String, default: null },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"], default: null },
    birthday: { type: Date, default: null },
    availableSpins: { type: Number, default: 1 },
    lastSpinDate: { type: Date, default: null },
    vouchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Promotion" }],
    lastMiniGameDate: { type: Date, default: null },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    addresses: [
      {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        ward: { type: String },
        wardCode: { type: String },
        district: { type: String },
        districtId: { type: Number },
        province: { type: String },
        provinceId: { type: Number },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
