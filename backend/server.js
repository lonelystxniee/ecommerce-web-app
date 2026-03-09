require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const shippingRoutes = require("./src/routes/shippingRoutes");
const productRoutes = require("./src/routes/productRoutes");
const categoryRoutes = require("./src/routes/category.routes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const addressRoutes = require("./src/routes/addressRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/shipping', shippingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/addresses", addressRoutes);
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server đang chạy ở cổng ${PORT}`);
  });
});
