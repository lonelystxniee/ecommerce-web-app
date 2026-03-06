const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken: authMiddleware } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const upload = require("../middlewares/upload.middleware");

router.get("/search", productController.searchProduct);
router.get("/", productController.getAllProducts);
router.delete("/:id", productController.deleteProduct);
router.put("/:id", upload.array("images", 10), productController.updateProduct);
router.get("/:id", productController.getProductById);

router.post(
    "/",
    adminMiddleware,
    upload.array("images", 10),
    productController.createProduct
);
router.post(
    "/import-excel",
    adminMiddleware,
    upload.single("file"),
    productController.importExcel
);

module.exports = router;
