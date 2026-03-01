require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const shippingRoutes = require("./src/routes/shippingRoutes");

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/shipping', shippingRoutes);
const PORT = process.env.PORT || 5175;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server đang chạy ở cổng ${PORT}`);
  });
});
