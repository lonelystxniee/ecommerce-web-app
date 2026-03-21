const router = require("express").Router();
const revenueController = require("../controllers/revenueController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Chỉ Admin mới được xem và nhập thu chi
router.get("/report", verifyToken, revenueController.getRevenueReport);
router.post("/ad-revenue", verifyToken, revenueController.createAdRevenue);
router.delete(
  "/ad-revenue/:id",
  verifyToken,
  revenueController.deleteAdRevenue,
);

module.exports = router;
