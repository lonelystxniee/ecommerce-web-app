const router = require("express").Router();
const promoController = require("../controllers/promotionController");
router.get("/all", promoController.getAll);
router.post("/create", promoController.create);
router.put("/update/:id", promoController.update);
router.delete("/delete/:id", promoController.delete);
router.post("/check", promoController.checkCode);
module.exports = router;
