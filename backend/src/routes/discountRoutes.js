const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

// Public route to get the active banner
router.get('/active-banner', discountController.getActiveBanner);

// Admin routes (would need auth middleware)
router.post('/', discountController.createDiscount);

module.exports = router;
