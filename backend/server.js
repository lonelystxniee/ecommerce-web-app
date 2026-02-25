require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
const PORT = process.env.PORT || 5175;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server đang chạy ở cổng ${PORT}`);
  });
});
