const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // allow an explicit 'ai' role so AI-generated messages can be identified
    senderRole: { type: String, enum: ["admin", "customer", "ai"], default: "customer" },
    content: { type: String, required: true },
    clientId: { type: String },
    read: { type: Boolean, default: false },
    isAI: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
