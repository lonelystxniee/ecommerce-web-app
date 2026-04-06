const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const adminMiddleware = require("../middlewares/admin.middleware");
const { verifyToken } = require("../middlewares/authMiddleware");

// POST /api/admin/orders/:id/ship -> create GHN shipment (auth -> admin)
router.post(
  "/:id/ship",
  verifyToken,
  adminMiddleware,
  orderController.adminHandover,
);
// Admin hủy đơn
router.put(
  "/:id/cancel",
  verifyToken,
  adminMiddleware,
  orderController.adminCancel,
);

router.put(
  "/:id/confirm-returned",
  verifyToken,
  adminMiddleware,
  orderController.adminConfirmReturned,
);

module.exports = router;
