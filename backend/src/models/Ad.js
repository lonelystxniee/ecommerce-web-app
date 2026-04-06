const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["hero", "sidebar", "popup"],
      required: true,
    },
    image: { type: String, required: true },
    link: { type: String, default: "#" },
    status: { type: String, default: "ACTIVE" },
    position: { type: Number, default: 1 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ad", AdSchema);
