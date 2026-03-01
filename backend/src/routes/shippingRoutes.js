const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

router.post('/calculate', shippingController.calculate);
router.post('/create', shippingController.create);
router.get('/detail', shippingController.getDetail);
router.post('/webhook', shippingController.webhook);

module.exports = router;
