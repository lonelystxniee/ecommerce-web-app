const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const vnpayController = require("../controllers/vnpayController");
const {
  verifyToken: authMiddleware,
} = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/admin.middleware");

router.post("/create", orderController.createOrder);
router.get("/my-orders/:userId", authMiddleware, orderController.getMyOrders);
router.get("/user/:userId", authMiddleware, orderController.getMyOrders);
router.get(
  "/all",
  authMiddleware,
  adminMiddleware,
  orderController.getAllOrders,
);
router.put(
  "/status/:id",
  authMiddleware,
  adminMiddleware,
  orderController.updateOrderStatus,
);

// New features from TapHoa
router.post("/vnpay-payment", vnpayController.createVnpayPayment);
router.put(
  "/confirm/:id",
  authMiddleware,
  adminMiddleware,
  orderController.adminConfirm,
);
router.put(
  "/pack/:id",
  authMiddleware,
  adminMiddleware,
  orderController.adminPacking,
);
router.put(
  "/handover/:id",
  authMiddleware,
  adminMiddleware,
  orderController.adminHandover,
);
router.get("/detail/:id", orderController.getOrderDetail);
router.post("/shipper-update", orderController.shipperUpdateStatus);
router.get("/my-orders/:userId", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);
router.get("/", orderController.getAllOrders);

module.exports = router;
