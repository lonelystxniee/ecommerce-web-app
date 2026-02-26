const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/create", orderController.createOrder);
router.get("/my-orders/:userId", orderController.getMyOrders);
router.get("/all", orderController.getAllOrders);
router.put("/status/:id", orderController.updateOrderStatus);

module.exports = router;
