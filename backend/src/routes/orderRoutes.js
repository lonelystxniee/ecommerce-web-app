const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const vnpayController = require("../controllers/vnpayController");
const { verifyToken } = require("../middlewares/authMiddleware");
const shipperMiddleware = require("../middlewares/shipper.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

router.post("/create", orderController.createOrder);
router.get("/my-orders/:userId", orderController.getMyOrders);
router.get("/all", orderController.getAllOrders);
router.put("/status/:id", orderController.updateOrderStatus);
router.put("/cancel/:id", verifyToken, orderController.userCancel);
router.post("/vnpay-payment", vnpayController.createVnpayPayment);
router.put(
  "/confirm/:id",
  verifyToken,
  adminMiddleware,
  orderController.adminConfirm,
);
router.put(
  "/pack/:id",
  verifyToken,
  adminMiddleware,
  orderController.adminPacking,
);
router.put(
  "/handover/:id",
  verifyToken,
  adminMiddleware,
  orderController.adminHandover,
);
router.get("/detail/:id", orderController.getOrderDetail);
router.get("/:id/ghn", verifyToken, orderController.getGHNInfo);

router.post(
  "/:id/ship",
  verifyToken,
  require("../middlewares/shipper.middleware"),
  orderController.createShipment,
);

if (process.env.ALLOW_SHIPPER_NOAUTH === "true") {
  router.post("/shipper-update", orderController.shipperUpdateStatus);
} else {
  router.post(
    "/shipper-update",
    verifyToken,
    shipperMiddleware,
    orderController.shipperUpdateStatus,
  );
}
router.get("/:id", orderController.getOrderById);
router.get("/", orderController.getAllOrders);
router.put("/request-return/:id", verifyToken, orderController.requestReturn);
module.exports = router;
