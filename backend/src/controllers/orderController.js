const Order = require("../models/Order");
const Promotion = require("../models/Promotion"); // Import model khuyến mãi
const ghn = require("./ghnController");
const activityController = require("./activityController");

// HÀM HỖ TRỢ: Thêm lịch sử hành trình không trùng lặp
const addUniqueHistory = (order, status, desc) => {
  const normalizedStatus = status.toLowerCase();
  const isExisted = order.trackingHistory.find(
    (h) => h.status.toLowerCase() === normalizedStatus || h.desc === desc,
  );
  if (!isExisted) {
    order.trackingHistory.push({
      status: normalizedStatus,
      desc: desc,
      time: new Date(),
    });
    return true;
  }
  return false;
};

// 1. Khách đặt hàng: CHỈ lưu vào DB, trạng thái PENDING
exports.createOrder = async (req, res) => {
  try {
    const {
      customerInfo,
      items,
      totalPrice,
      paymentMethod,
      userId,
      promoCode,
    } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Giỏ hàng trống!" });
    }

    // Nếu có mã giảm giá, tăng số lượt đã sử dụng trong DB
    if (promoCode) {
      await Promotion.findOneAndUpdate(
        { code: promoCode.toUpperCase() },
        { $inc: { usedCount: 1 } },
      );
    }

    const newOrder = new Order({
      userId,
      customerInfo,
      items,
      totalPrice,
      paymentMethod,
      promoCode: promoCode || null,
      status: "PENDING", // LUÔN BẮT ĐẦU TỪ PENDING
      trackingHistory: [
        {
          status: "pending",
          desc: promoCode
            ? `Đơn hàng đã đặt thành công (Mã: ${promoCode})`
            : "Đơn hàng đã được đặt thành công",
          time: new Date(),
        },
      ],
    });

    await newOrder.save();
    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      orderId: newOrder._id,
    });

    // KHÔNG gọi ghn.createGHNOrder ở đây để giữ trạng thái PENDING
  } catch (error) {
    console.error("Lỗi createOrder:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Admin: Xác nhận đơn hàng
exports.adminConfirm = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    addUniqueHistory(order, "confirmed", "Hệ thống đã xác nhận đơn hàng");
    order.status = "CONFIRMED";
    await order.save();

    // Ghi log
    if (req.user) {
      await activityController.createLog(
        req.user.id,
        "Xác nhận đơn hàng",
        `Đã xác nhận đơn hàng: ${order._id}`,
        req,
      );
    }

    res.json({
      success: true,
      message: "Đã xác nhận đơn hàng thành công",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Admin: Đóng gói sản phẩm
exports.adminPacking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    addUniqueHistory(order, "packing", "Shop đang chuẩn bị hàng và đóng gói");
    order.status = "PACKING";
    await order.save();

    // Ghi log
    if (req.user) {
      await activityController.createLog(
        req.user.id,
        "Đóng gói đơn hàng",
        `Đã đóng gói đơn hàng: ${order._id}`,
        req,
      );
    }

    res.json({ success: true, message: "Đã đóng gói thành công", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Admin: BÀN GIAO CHO SHIPPER (Lúc này mới gọi GHN và sang READY_TO_PICK)
exports.adminHandover = async (req, res) => {
  try {
    const orderId = req.params.id;
    // Gọi hàm tạo đơn thật bên bưu cục GHN
    await ghn.createGHNOrder(orderId);

    const updatedOrder = await Order.findById(orderId);
    res.json({
      success: true,
      message: "Đã bàn giao đơn cho GHN",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. User Sync: Đồng bộ trạng thái thực tế từ GHN
exports.getOrderDetail = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    if (order.ghnOrderCode) {
      const ghnInfo = await ghn.getGHNTracking(order.ghnOrderCode);
      if (ghnInfo && ghnInfo.status) {
        const ghnStatus = ghnInfo.status.toLowerCase();
        const statusMap = {
          ready_to_pick: "Shipper đang đến lấy hàng",
          picking: "Shipper đã lấy hàng thành công và đang chuyển về bưu cục",
          storing: "Đơn hàng đã nhập kho tập kết Mega SOC",
          delivering: "Đơn hàng đang trên đường giao đến bạn",
          delivered: "Giao hàng thành công! Cảm ơn bạn.",
        };

        const changed = addUniqueHistory(
          order,
          ghnStatus,
          statusMap[ghnStatus] || ghnStatus,
        );
        if (changed) {
          // Chỉ cập nhật status chính nếu không phải bước kho 'storing'
          if (ghnStatus !== "storing") order.status = ghnStatus.toUpperCase();
          await order.save();
        }
      }
    }
    order.trackingHistory.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Shipper App: Cập nhật quy trình 4 bước bưu cục
exports.shipperUpdateStatus = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order || !order.ghnOrderCode)
      return res
        .status(400)
        .json({ success: false, message: "Đơn hàng không hợp lệ" });

    const ghnRes = await ghn.leadtimeGHNOrder(order.ghnOrderCode);
    if (ghnRes && ghnRes.code === 200) {
      const currentStatus = order.status.toUpperCase();

      if (currentStatus === "READY_TO_PICK") {
        order.status = "PICKING";
        addUniqueHistory(
          order,
          "picking",
          "Shipper đã lấy hàng thành công và đang chuyển về bưu cục",
        );
      } else if (currentStatus === "PICKING") {
        order.status = "STORING";
        addUniqueHistory(
          order,
          "storing",
          "Đơn hàng đã nhập kho tập kết Mega SOC Hà Nội",
        );
      } else if (currentStatus === "STORING") {
        order.status = "DELIVERING";
        addUniqueHistory(
          order,
          "delivering",
          "Shipper đang trên đường giao hàng đến bạn",
        );
      } else if (currentStatus === "DELIVERING") {
        order.status = "COMPLETED";
        addUniqueHistory(
          order,
          "delivered",
          "Giao hàng thành công! Người nhận đã ký xác nhận.",
        );
      }

      await order.save();
      return res.json({ success: true, message: "Cập nhật thành công!" });
    }
    res
      .status(400)
      .json({ success: false, message: "Hệ thống GHN từ chối chuyển bước" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Các hàm khác
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

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    // Ghi log
    if (updated && req.user) {
      await activityController.createLog(
        req.user.id,
        "Cập nhật đơn hàng",
        `Đã cập nhật trạng thái đơn hàng ${updated._id} thành ${status}`,
        req,
      );
    }

    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
