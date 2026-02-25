const express = require("express");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();
app.use(express.json());

// Connect to MongoDB then start server
connectDB().then(() => {
  app.use("/api/auth", authRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/category", categoryRoutes);

  app.listen(process.env.PORT, () =>
    console.log("Server running on port " + process.env.PORT)
  );
});