const ghn = require('../services/ghnService');
const Order = require('../models/Order');

exports.calculate = async (req, res) => {
  try {
    const body = req.body;
    if (!body.to_district_id || !body.to_ward_code || !body.weight) {
      return res.status(400).json({ success: false, message: 'to_district_id, to_ward_code and weight required' });
    }
    const result = await ghn.calculateFee(body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to calculate fee' });
  }
};

exports.create = async (req, res) => {
  try {
    const { orderId, ghnBody } = req.body; // ghnBody is prepared request for GHN

    let payload = ghnBody;

    // If orderId provided but no ghnBody, build payload from Order
    if (orderId && !payload) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      // Expect shop origin config in env
      const from_district_id = process.env.GHN_SHOP_DISTRICT_ID ? Number(process.env.GHN_SHOP_DISTRICT_ID) : undefined;
      const from_ward_code = process.env.GHN_SHOP_WARD_CODE || undefined;
      const from_address = process.env.GHN_FROM_ADDRESS || '';

      const to_district_id = order.shipping?.shippingAddressStructured?.district?.id || order.shipping?.shippingAddressStructured?.district?.district_id || undefined;
      const to_ward_code = order.shipping?.shippingAddressStructured?.ward?.code || order.shipping?.shippingAddressStructured?.ward?.WardCode || undefined;
      const to_address = order.shipping?.shippingAddressStructured?.detail || order.customerInfo.address || '';

      const weight = order.shipping?.shippingWeight || order.items.reduce((s, it) => s + ((it.weight || 300) * (it.quantity || 1)), 0);

      payload = {
        // GHN requires shop_id added by service; other fields below
        to_name: order.customerInfo.fullName,
        to_phone: order.customerInfo.phone,
        to_address: to_address,
        to_ward_code: to_ward_code,
        to_district_id: Number(to_district_id),
        pick_station_id: null,
        required_note: '',
        client_order_code: String(order._id),
        CODAmount: order.paymentMethod === 'COD' ? (order.totalPrice || 0) : 0,
        content: order.items.map(i => `${i.name} x${i.quantity}`).join('; '),
        weight: Number(weight),
        length: order.shipping?.shippingDimensions?.length || 0,
        width: order.shipping?.shippingDimensions?.width || 0,
        height: order.shipping?.shippingDimensions?.height || 0,
      };

      // add from info if available
      if (from_district_id) payload.from_district_id = Number(from_district_id);
      if (from_ward_code) payload.from_ward_code = from_ward_code;
      if (from_address) payload.from_address = from_address;
    }

    if (!payload) return res.status(400).json({ success: false, message: 'ghnBody or orderId required' });

    const ghnRes = await ghn.createOrder(payload);

    // save to Order if orderId provided
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.shipping = order.shipping || {};
        const orderCode = (ghnRes && ghnRes.data && (ghnRes.data.order_code || ghnRes.data.data && ghnRes.data.data.order_code)) || (ghnRes && ghnRes.data && ghnRes.data.orderId) || null;
        order.shipping.ghnOrderCode = orderCode || order.shipping.ghnOrderCode;
        // try to map shipping fee back
        if (ghnRes && ghnRes.data && ghnRes.data.total_fee) {
          order.shipping.shippingFee = ghnRes.data.total_fee;
        }
        await order.save();
      }
    }

    res.json({ success: true, ghnRes });
  } catch (err) {
    const logger = require('../utils/logger');
    logger.error('shipping.create error', err.message || err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create GHN order' });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const { order_code, orderId } = req.query;
    if (!order_code && !orderId) return res.status(400).json({ success: false, message: 'order_code or orderId required' });
    let code = order_code;
    if (!code && orderId) {
      const order = await Order.findById(orderId);
      if (!order || !order.shipping || !order.shipping.ghnOrderCode) return res.status(404).json({ success: false, message: 'GHN order code not found in order' });
      code = order.shipping.ghnOrderCode;
    }
    const detail = await ghn.getOrderDetail(code);
    res.json({ success: true, detail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get GHN order detail' });
  }
};

// webhook receiver
exports.webhook = async (req, res) => {
  try {
    const payload = req.body;
    // GHN webhook structure varies; try to extract order_code and status
    const order_code = payload.order_code || (payload.data && payload.data.order_code) || null;
    const status = payload.status || (payload.data && payload.data.status) || null;

    if (order_code) {
      const order = await Order.findOne({ 'shipping.ghnOrderCode': order_code });
      if (order) {
        order.shipping.shippingStatus = status || order.shipping.shippingStatus;
        order.shipping.shippingEvents = order.shipping.shippingEvents || [];
        order.shipping.shippingEvents.push({ time: new Date(), status: status || 'updated', note: JSON.stringify(payload) });
        await order.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Webhook handler error' });
  }
};
