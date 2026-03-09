const ghn = require('../services/ghnService');

exports.getProvinces = async (req, res) => {
  try {
    const provinces = await ghn.getProvinces();
    res.json({ success: true, provinces });
  } catch (err) {
    const logger = require('../utils/logger');
    logger.error('getProvinces error', err.message || err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch provinces' });
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const { provinceId } = req.query;
    if (!provinceId) return res.status(400).json({ success: false, message: 'provinceId required' });
    const districts = await ghn.getDistricts(provinceId);
    res.json({ success: true, districts });
  } catch (err) {
    const logger = require('../utils/logger');
    logger.error('getDistricts error', err.message || err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch districts' });
  }
};

exports.getWards = async (req, res) => {
  try {
    const { districtId } = req.query;
    if (!districtId) return res.status(400).json({ success: false, message: 'districtId required' });
    const wards = await ghn.getWards(districtId);
    res.json({ success: true, wards });
  } catch (err) {
    const logger = require('../utils/logger');
    logger.error('getWards error', err.message || err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch wards' });
  }
};
