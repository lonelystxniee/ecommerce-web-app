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

    // If frontend provides structured shippingInfo (province/district/ward/detail, weight, dims), calculate fee and save
    if (shippingInfo && shippingInfo.to_district_id && shippingInfo.to_ward_code && shippingInfo.weight) {
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
        // Map fee into order.shipping
        newOrder.shipping = newOrder.shipping || {};
        // GHN response mapping may vary; try common locations
        const feeData = feeRes.data || feeRes;
        // pick first fee if array
        if (feeData && Array.isArray(feeData) && feeData.length > 0) {
          newOrder.shipping.shippingFee = feeData[0].total || feeData[0].shipping_fee || 0;
          newOrder.shipping.shippingServiceId = feeData[0].service_id || feeData[0].service_type_id || '';
          newOrder.shipping.shippingServiceName = feeData[0].short_description || feeData[0].service_name || '';
        } else if (feeData && typeof feeData === 'object') {
          newOrder.shipping.shippingFee = feeData.total || feeData.shipping_fee || 0;
        }
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
        // don't block order creation if fee lookup fails; log and continue
        console.error('GHN fee lookup failed:', feeErr.message || feeErr);
      }
    }

    await newOrder.save();

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
