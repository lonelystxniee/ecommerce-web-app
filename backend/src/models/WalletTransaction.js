const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["TOPUP", "REFUND", "PAYMENT"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    vnp_TxnRef: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
