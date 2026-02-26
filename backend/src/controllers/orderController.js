const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { customerInfo, items, totalPrice, paymentMethod, userId } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Giỏ hàng trống!" });
    }

    const newOrder = new Order({
      userId,
      customerInfo,
      items,
      totalPrice,
      paymentMethod,
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      orderId: newOrder._id,
    });
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

// Thêm vào orderController.js
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng (Dùng cho Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
