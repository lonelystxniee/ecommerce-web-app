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
    googleId: { type: String, default: null },
    authProvider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" },
    avatar: { type: String, default: null },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"], default: null },
    birthday: { type: Date, default: null },
    addresses: [
      {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        ward: { type: String },
        district: { type: String },
        province: { type: String },
        // store GHN ids/codes to allow exact mapping
        provinceId: { type: String },
        districtId: { type: String },
        wardCode: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
