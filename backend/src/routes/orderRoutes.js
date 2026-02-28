const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken: authMiddleware } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/admin.middleware");

router.post("/create", orderController.createOrder);
router.get("/my-orders/:userId", authMiddleware, orderController.getMyOrders);
router.get("/all", authMiddleware, adminMiddleware, orderController.getAllOrders);
router.put("/status/:id", authMiddleware, adminMiddleware, orderController.updateOrderStatus);

module.exports = router;
