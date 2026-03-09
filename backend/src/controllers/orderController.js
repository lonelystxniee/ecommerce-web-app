const Order = require("../models/Order");
const ghn = require('../services/ghnService');

exports.createOrder = async (req, res) => {
  try {
    const { customerInfo, items, totalPrice, paymentMethod, userId, shippingInfo } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống!" });
    }

    const newOrder = new Order({
      userId,
      customerInfo,
      items,
      totalPrice,
      paymentMethod,
    });

    // Prepare shipping and compute totalPrice. Priority:
    // 1) Use shippingFee provided by frontend in shippingInfo.shippingFee
    // 2) Otherwise try to calculate via GHN using structured shippingInfo
    // 3) Fallback to 0
    const subtotalFromItems = (items || []).reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
    let shippingFeeValue = 0;
    newOrder.shipping = newOrder.shipping || {};

    if (shippingInfo && typeof shippingInfo.shippingFee !== 'undefined') {
      shippingFeeValue = Number(shippingInfo.shippingFee) || 0;
      newOrder.shipping.shippingFee = shippingFeeValue;
      newOrder.shipping.shippingAddressStructured = {
        province: shippingInfo.province || {},
        district: shippingInfo.district || {},
        ward: shippingInfo.ward || {},
        detail: shippingInfo.detail || customerInfo.address || '',
      };
      newOrder.shipping.shippingWeight = shippingInfo.weight || undefined;
      newOrder.shipping.shippingDimensions = {
        length: shippingInfo.length || 0,
        width: shippingInfo.width || 0,
        height: shippingInfo.height || 0,
      };
    } else if (shippingInfo && shippingInfo.to_district_id && shippingInfo.to_ward_code && shippingInfo.weight) {
      try {
        const feeBody = {
          to_district_id: shippingInfo.to_district_id,
          to_ward_code: shippingInfo.to_ward_code,
          weight: shippingInfo.weight,
          length: shippingInfo.length || 0,
          width: shippingInfo.width || 0,
          height: shippingInfo.height || 0,
          insurance_value: shippingInfo.insurance_value || 0,
        };
        const feeRes = await ghn.calculateFee(feeBody);
        const feeData = feeRes.data || feeRes;
        if (feeData && Array.isArray(feeData) && feeData.length > 0) {
          shippingFeeValue = Number(feeData[0].total || feeData[0].shipping_fee || 0);
          newOrder.shipping.shippingServiceId = feeData[0].service_id || feeData[0].service_type_id || '';
          newOrder.shipping.shippingServiceName = feeData[0].short_description || feeData[0].service_name || '';
        } else if (feeData && typeof feeData === 'object') {
          shippingFeeValue = Number(feeData.total || feeData.shipping_fee || 0);
        }
        newOrder.shipping.shippingFee = shippingFeeValue;
        newOrder.shipping.shippingWeight = shippingInfo.weight;
        newOrder.shipping.shippingDimensions = {
          length: shippingInfo.length || 0,
          width: shippingInfo.width || 0,
          height: shippingInfo.height || 0,
        };
        newOrder.shipping.shippingAddressStructured = {
          province: shippingInfo.province || {},
          district: shippingInfo.district || {},
          ward: shippingInfo.ward || {},
          detail: shippingInfo.detail || customerInfo.address || '',
        };
      } catch (feeErr) {
        console.error('GHN fee lookup failed:', feeErr.message || feeErr);
      }
    }

    // Compute final totalPrice (prefer frontend sent totalPrice if it equals subtotal+shipping)
    const computedTotal = subtotalFromItems + (shippingFeeValue || 0);
    // If frontend sent totalPrice and it matches computedTotal, keep it; otherwise override with computedTotal
    if (Number(totalPrice) && Number(totalPrice) === computedTotal) {
      newOrder.totalPrice = Number(totalPrice);
    } else {
      newOrder.totalPrice = computedTotal;
    }

    await newOrder.save();

    // Ensure totalPrice persisted is numeric and includes shipping fee
    try {
      const subtotal = Number(totalPrice) || (newOrder.items || []).reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
      const shippingFee = Number(newOrder.shipping?.shippingFee) || 0;
      // If DB value differs, update the saved order to reflect correct grand total
      if (Number(newOrder.totalPrice) !== subtotal + shippingFee) {
        newOrder.totalPrice = subtotal + shippingFee;
        await newOrder.save();
      }
    } catch (err) {
      console.error('Ensure totalPrice save error', err.message || err);
    }

    res.status(201).json({ success: true, message: "Đặt hàng thành công!", orderId: newOrder._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách đơn hàng của một User (Dùng cho trang Account)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: list all orders (simple, unpaginated)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
