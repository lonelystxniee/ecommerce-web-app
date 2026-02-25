const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("✅ Kết nối MongoDB thành công!");
  } catch (err) {
    console.error("❌ Kết nối MongoDB thất bại!");
    process.exit(1);
  }
};

module.exports = connectDB;
