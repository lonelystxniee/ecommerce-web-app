const fetch = require('node-fetch');
const logger = require('../utils/logger');
const GHN_API_BASE = process.env.GHN_API_BASE;
const GHN_TOKEN = process.env.GHN_TOKEN;
const GHN_SHOP_ID = process.env.GHN_SHOP_ID;

if (!GHN_API_BASE || !GHN_TOKEN) {
  console.warn('GHN not configured (GHN_API_BASE or GHN_TOKEN missing)');
}

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Token': GHN_TOKEN,
  'ShopId': String(GHN_SHOP_ID),
});

async function request(path, options = {}, retries = 2) {
  const url = `${GHN_API_BASE}${path}`;
  try {
    logger.info('GHN request', path);
    const res = await fetch(url, { headers: { ...defaultHeaders(), ...(options.headers || {}) }, ...options });
    const data = await res.json();
    // GHN usually returns { code: 200, data: ... } or similar
    if (data && (data.code === 200 || data.success === true || data.data)) {
      return data;
    }
    // treat non-200/empty as error
    const err = new Error('GHN API error');
    err.response = data;
    throw err;
  } catch (err) {
    logger.warn('GHN request error', path, err.message || err);
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 500));
      return request(path, options, retries - 1);
    }
    logger.error('GHN request failed', path, err);
    throw err;
  }
}

function mapMasterResponse(raw) {
  // normalize GHN master-data response
  if (!raw) return [];
  if (raw.data) return raw.data;
  return raw;
}

module.exports = {
  // master data
  getProvinces: async () => {
    const raw = await request('/master-data/province', { method: 'GET' });
    return mapMasterResponse(raw);
  },
  getDistricts: async (province_id) => {
    const raw = await request(`/master-data/district?province_id=${province_id}`, { method: 'GET' });
    return mapMasterResponse(raw);
  },
  getWards: async (district_id) => {
    const raw = await request(`/master-data/ward?district_id=${district_id}`, { method: 'GET' });
    return mapMasterResponse(raw);
  },

  // calculate fee
  calculateFee: async (body) => {
    const payload = {
      shop_id: GHN_SHOP_ID,
      ...body,
    };
    const raw = await request('/v2/shipping-order/fee', { method: 'POST', body: JSON.stringify(payload) });
    return raw;
  },

  // create shipping order
  createOrder: async (body) => {
    const payload = {
      shop_id: GHN_SHOP_ID,
      ...body,
    };
    const raw = await request('/v2/shipping-order/create', { method: 'POST', body: JSON.stringify(payload) });
    return raw;
  },

  // get order detail
  getOrderDetail: async (order_code) => {
    const raw = await request(`/v2/shipping-order/detail?order_code=${order_code}`, { method: 'GET' });
    return raw;
  },

  // cancel order
  cancelOrder: async (body) => {
    const payload = { shop_id: GHN_SHOP_ID, ...body };
    const path = '/v2/shipping-order/cancel';
    const url = `${GHN_API_BASE}${path}`;
    try {
      logger.info('GHN cancel payload', payload);
      const res = await fetch(url, { method: 'POST', headers: defaultHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      // Return raw data so caller can inspect non-200 responses without an exception
      if (!data) {
        logger.warn('GHN cancel returned empty response', { url, payload });
      }
      return data;
    } catch (err) {
      logger.error('GHN cancelOrder fetch error', err.message || err);
      throw err;
    }
  },
};
