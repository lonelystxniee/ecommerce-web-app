const router = require("express").Router();
const promoController = require("../controllers/promotionController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/all", promoController.getAll);
router.post("/create", promoController.create);
router.put("/update/:id", promoController.update);
router.delete("/delete/:id", promoController.delete);
router.post("/check", promoController.checkCode);
router.get("/active-banner", promoController.getActiveBanner);
router.get("/spin-status", verifyToken, promoController.getSpinStatus);
router.post("/use-spin", verifyToken, promoController.useSpin);
router.post("/add-spin", verifyToken, promoController.addSpin);
router.post("/save-win", verifyToken, promoController.saveWonVoucher);
router.get("/my-vouchers", verifyToken, promoController.getMyVouchers);

module.exports = router;
