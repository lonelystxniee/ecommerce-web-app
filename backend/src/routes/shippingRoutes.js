const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { verifyToken } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const shipperMiddleware = require('../middlewares/shipper.middleware');

// public fee calculator
router.post('/calculate', shippingController.calculate);

// create shipping order (authenticated - admin only)
router.post('/create', verifyToken, adminMiddleware, shippingController.create);

// create shipping order by shipper (when allowed) - shipper or admin
router.post('/create-shipper', verifyToken, require('../middlewares/shipper.middleware'), shippingController.create);

// get detail by code or orderId (authenticated - owner/admin/shipper allowed)
router.get('/detail', verifyToken, shippingController.getDetail);

// webhook from GHN (public)
router.post('/webhook', shippingController.webhook);

// get shipping events for an order (authenticated)
router.get('/events/:orderId', verifyToken, shippingController.getEvents);

// admin endpoints: set tracking code and update shipping status
router.put('/:orderId/tracking', verifyToken, adminMiddleware, shippingController.setTrackingCode);
router.put('/:orderId/status', verifyToken, adminMiddleware, shippingController.updateShippingStatus);

module.exports = router;
