const mongoose = require("mongoose");

const AdRevenueSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AdRevenue", AdRevenueSchema);
