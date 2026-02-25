const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        phone: { type: String, default: null },
        status: { type: String, enum: ["ACTIVE", "LOCKED"], default: "ACTIVE" },
        role: { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
