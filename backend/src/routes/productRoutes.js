const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken: authMiddleware } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const upload = require("../middlewares/upload.middleware");

router.get("/search", productController.searchProduct);
router.get("/low-stock", authMiddleware, adminMiddleware, productController.getLowStockProducts);
router.get("/", productController.getAllProducts);
router.delete("/:id", authMiddleware, productController.deleteProduct);
router.put("/:id", authMiddleware, upload.array("images", 10), productController.updateProduct);
router.get("/:id", productController.getProductById);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 10),
  productController.createProduct
);
router.post(
  "/import-excel",
  authMiddleware,
  adminMiddleware,
  upload.single("file"),
  productController.importExcel
);
router.post(
  "/bulk-stock-in",
  authMiddleware,
  adminMiddleware,
  productController.bulkStockIn
);
router.post(
  "/import-warehouse-excel",
  authMiddleware,
  adminMiddleware,
  upload.single("file"),
  productController.importWarehouseExcel
);

module.exports = router;
