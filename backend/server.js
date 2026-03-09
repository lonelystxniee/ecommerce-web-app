require("dotenv").config(); // Nạp biến môi trường đầu tiên
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const productRoutes = require("./src/routes/productRoutes");
const categoryRoutes = require("./src/routes/category.routes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const shippingRoutes = require("./src/routes/shippingRoutes");
const addressRoutes = require("./src/routes/addressRoutes");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/promotions", require("./src/routes/promotionRoutes"));
app.use("/api/locations", locationRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/wishlist", require("./src/routes/wishlistRoutes"));

const PORT = process.env.PORT || 5175;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server đang chạy ở cổng ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Không thể khởi động server do lỗi kết nối DB:", err.message);
  });
