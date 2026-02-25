const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  productController.createProduct
);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.delete("/:id", authMiddleware, adminMiddleware, productController.deleteProduct);
router.put("/:id", authMiddleware, adminMiddleware, productController.updateProduct);

module.exports = router;