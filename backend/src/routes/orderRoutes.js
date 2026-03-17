const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const vnpayController = require("../controllers/vnpayController");
const {
  verifyToken: authMiddleware,
} = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/admin.middleware");

router.post("/create", orderController.createOrder);
router.get("/my-orders/:userId", orderController.getMyOrders);
router.get("/all", orderController.getAllOrders);
router.put("/status/:id", orderController.updateOrderStatus);
router.post("/vnpay-payment", vnpayController.createVnpayPayment);
router.put("/confirm/:id", orderController.adminConfirm);
router.put("/pack/:id", orderController.adminPacking);
router.put("/handover/:id", orderController.adminHandover);
router.get("/detail/:id", orderController.getOrderDetail);
router.post("/shipper-update", orderController.shipperUpdateStatus);

module.exports = router;
