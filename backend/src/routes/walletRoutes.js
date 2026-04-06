const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/balance", verifyToken, walletController.getBalance);
router.post("/topup", verifyToken, walletController.createTopupUrl);
router.get("/vnpay-return", walletController.vnpayReturnWallet);

module.exports = router;
