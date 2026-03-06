require("dotenv").config(); // Nạp biến môi trường đầu tiên
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const productRoutes = require("./src/routes/productRoutes");
const categoryRoutes = require("./src/routes/category.routes");
const reviewRoutes = require("./src/routes/reviewRoutes");

const app = express();

app.use(cors());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/reviews", reviewRoutes);

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
