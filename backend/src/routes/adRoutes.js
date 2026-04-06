const express = require("express");
const router = express.Router();
const adController = require("../controllers/adController");

// Tất cả đều bắt đầu bằng /api/ads
router.get("/", adController.getAllAds);
router.post("/", adController.createAd);
router.put("/:id", adController.updateAd);
router.delete("/:id", adController.deleteAd);

module.exports = router;
