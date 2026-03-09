const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', addressController.getAddresses);
router.post('/', addressController.addAddress);
router.put('/:addressId', addressController.updateAddress);
router.delete('/:addressId', addressController.deleteAddress);

module.exports = router;
