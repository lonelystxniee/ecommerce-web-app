const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "CUSTOMER" },
    status: { type: String, default: "ACTIVE" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
