const router = require("express").Router();
const promoController = require("../controllers/promotionController");

const { verifyToken: authMiddleware } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/admin.middleware");

router.get("/all", authMiddleware, adminMiddleware, promoController.getAll);
router.post("/create", authMiddleware, adminMiddleware, promoController.create);
router.put("/update/:id", authMiddleware, adminMiddleware, promoController.update);
router.delete("/delete/:id", authMiddleware, adminMiddleware, promoController.delete);
router.post("/check", promoController.checkCode);
router.get("/active-banner", promoController.getActiveBanner);

module.exports = router;
