const Order = require("../models/Order");
const Promotion = require("../models/Promotion");
const ghn = require("./ghnController");
const activityController = require("./activityController");

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
      shippingInfo,
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

    // Tính subtotal từ items (dự đoán trường `price` và `quantity` theo schema)
    const subtotalFromItems = items.reduce((sum, it) => {
      const price = Number(it.price || it.unitPrice || 0) || 0;
      const qty = Number(it.quantity || it.qty || 1) || 0;
      return sum + price * qty;
    }, 0);

    // chuẩn bị order nhưng chưa lưu — sẽ set shipping và total rồi save một lần
    const newOrder = new Order({
      userId,
      customerInfo,
      items,
      totalPrice: subtotalFromItems,
      paymentMethod,
      promoCode: promoCode || null,
      status: "PENDING",
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

    // shipping defaults
    let shippingFeeValue = 0;

    

    if (shippingInfo && typeof shippingInfo.shippingFee !== "undefined") {
      shippingFeeValue = Number(shippingInfo.shippingFee) || 0;
      newOrder.shipping.shippingFee = shippingFeeValue;
      if (shippingInfo.shippingPaidBy) newOrder.shipping.shippingPaidBy = shippingInfo.shippingPaidBy;
      newOrder.shipping.shippingAddressStructured = {
        province:
          typeof shippingInfo.province === "string"
            ? { name: shippingInfo.province }
            : shippingInfo.province || {},
        district:
          typeof shippingInfo.district === "string"
            ? { name: shippingInfo.district }
            : shippingInfo.district || {},
        ward:
          typeof shippingInfo.ward === "string"
            ? { name: shippingInfo.ward }
            : shippingInfo.ward || {},
        detail: shippingInfo.detail || customerInfo.address || "",
      };
      newOrder.shipping.shippingWeight = shippingInfo.weight || undefined;
      newOrder.shipping.shippingDimensions = {
        length: shippingInfo.length || 0,
        width: shippingInfo.width || 0,
        height: shippingInfo.height || 0,
      };
    } else if (
      shippingInfo &&
      shippingInfo.to_district_id &&
      shippingInfo.to_ward_code &&
      shippingInfo.weight
    ) {
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
          shippingFeeValue = Number(
            feeData[0].total || feeData[0].shipping_fee || 0,
          );
          newOrder.shipping.shippingServiceId =
            feeData[0].service_id || feeData[0].service_type_id || "";
          newOrder.shipping.shippingServiceName =
            feeData[0].short_description || feeData[0].service_name || "";
        } else if (feeData && typeof feeData === "object") {
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
          province:
            typeof shippingInfo.province === "string"
              ? { name: shippingInfo.province }
              : shippingInfo.province || {},
          district:
            typeof shippingInfo.district === "string"
              ? { name: shippingInfo.district }
              : shippingInfo.district || {},
          ward:
            typeof shippingInfo.ward === "string"
              ? { name: shippingInfo.ward }
              : shippingInfo.ward || {},
          detail: shippingInfo.detail || customerInfo.address || "",
        };
      } catch (feeErr) {
        console.error("GHN fee lookup failed:", feeErr.message || feeErr);
      }
    }

    // compute final total (subtotal + shipping)
    const computedTotal = subtotalFromItems + (shippingFeeValue || 0);

    
    if (Number(totalPrice) && Number(totalPrice) === computedTotal) {
      newOrder.totalPrice = Number(totalPrice);
    } else {
      newOrder.totalPrice = computedTotal;
    }

    // ensure shipping fee is persisted (default 0 if not set)
    newOrder.shipping.shippingFee = Number(newOrder.shipping.shippingFee || shippingFeeValue || 0);

    await newOrder.save();

    // Ghi log hoạt động đặt hàng
    try {
      await activityController.createLog(
        userId,
        "Đặt đơn hàng",
        `Người dùng đã đặt đơn hàng mới mã ${newOrder._id.toString().slice(-8).toUpperCase()} trị giá ${newOrder.totalPrice.toLocaleString()}đ`,
        req,
      );
    } catch (err) {
      console.error("Lỗi ghi log hoạt động khi tạo đơn hàng:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      orderId: newOrder._id,
    });
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

    // Gọi GHN, nhưng không để lỗi GHN chặn toàn bộ quy trình
    let ghnError = null;
    try {
      await ghn.createGHNOrder(orderId);
    } catch (err) {
      ghnError = err.message || "GHN API failed";
      console.error("❌ GHN API error (non-blocking):", ghnError);
    }

    // Dù GHN có lỗi hay không, vẫn cập nhật trạng thái lên READY_TO_PICK
    const updatedOrder = await Order.findById(orderId);
    if (!updatedOrder)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    // Nếu GHN thất bại (không lưu ghnOrderCode), vẫn cập nhật status thủ công
    if (!updatedOrder.ghnOrderCode) {
      updatedOrder.status = "READY_TO_PICK";
      const orderId8 = updatedOrder._id.toString().slice(-8).toUpperCase();
      const desc = `Đã bàn giao đơn #${orderId8} cho GHN${ghnError ? " (GHN lỗi: " + ghnError + ")" : ""}`;
      const isExisted = updatedOrder.trackingHistory.find(
        (h) => h.status === "ready_to_pick",
      );
      if (!isExisted) {
        updatedOrder.trackingHistory.push({
          status: "ready_to_pick",
          desc,
          time: new Date(),
        });
      }
      await updatedOrder.save();
    }

    return res.json({
      success: true,
      message: ghnError
        ? `Đã bàn giao (GHN lỗi: ${ghnError}, trạng thái vẫn được cập nhật)`
        : "Đã bàn giao đơn cho GHN",
      order: updatedOrder,
      ghnError: ghnError || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: explicitly create shipment (wraps ghnController.createGHNOrder)
exports.createShipment = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    // allow forcing a recreate when caller passes ?force=true
    const force = String(req.query.force || '').toLowerCase() === 'true';
    if (order.ghnOrderCode && !force) {
      return res.status(400).json({ success: false, message: 'Đã có mã GHN, nếu muốn tạo lại hãy gửi ?force=true' });
    }

    // if force, clear persisted GHN codes so createGHNOrder runs fresh
    if (force) {
      order.ghnOrderCode = undefined;
      if (order.shipping) order.shipping.ghnOrderCode = undefined;
      await order.save();
    }

    // call GHN controller (which uses ghnService)
    const ghnCtrl = require('./ghnController');
    try {
      const code = await ghnCtrl.createGHNOrder(orderId);
      const updated = await Order.findById(orderId);
      return res.json({ success: true, message: 'Đã tạo đơn giao vận trên GHN', ghnOrderCode: updated.ghnOrderCode || code, order: updated });
    } catch (err) {
      // surface GHN error
      return res.status(500).json({ success: false, message: 'GHN tạo đơn thất bại', error: err.message || err.toString() });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get GHN info / tracking for order
exports.getGHNInfo = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

    // permission: admin, shipper or order owner
    if (req.user) {
      const isAdmin = req.user.role === 'ADMIN';
      const isShipper = req.user.role === 'SHIPPER';
      const isOwner = String(order.userId || '') === String(req.user._id || req.user.id || '');
      if (!isAdmin && !isShipper && !isOwner) {
        return res.status(403).json({ success: false, message: 'Không có quyền xem thông tin giao vận' });
      }
    }

    if (!order.ghnOrderCode) return res.json({ success: true, message: 'Không có mã GHN', ghnOrderCode: null, order });

    const ghnCtrl = require('./ghnController');
    const ghnInfo = await ghnCtrl.getGHNTracking(order.ghnOrderCode);
    return res.json({ success: true, ghnInfo, ghnOrderCode: order.ghnOrderCode, order });
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
    const allowNoAuthSim = process.env.ALLOW_SHIPPER_NOAUTH === 'true';

    if (!order || (!order.ghnOrderCode && !allowNoAuthSim))
      return res.status(400).json({ success: false, message: "Đơn hàng không hợp lệ" });

    // helper to advance order state locally
    const advanceLocalStatus = () => {
      const currentStatus = (order.status || '').toUpperCase();
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
    };

    // If simulation mode is enabled, skip calling GHN and just advance status
    if (allowNoAuthSim) {
      console.log('[shipperUpdateStatus] ALLOW_SHIPPER_NOAUTH=true — advancing status without GHN');
      advanceLocalStatus();
      await order.save();
      return res.json({ success: true, message: "Cập nhật thành công (simulated)" });
    }

    // Normal flow: call GHN to advance step
    const ghnRes = await ghn.leadtimeGHNOrder(order.ghnOrderCode);
    if (ghnRes && ghnRes.code === 200) {
      advanceLocalStatus();
      await order.save();
      return res.json({ success: true, message: "Cập nhật thành công!" });
    }

    res.status(400).json({ success: false, message: "Hệ thống GHN từ chối chuyển bước" });
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

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
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

// Khách hàng hủy đơn (yêu cầu đăng nhập và là chủ đơn)
exports.userCancel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    if (!req.user) return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập' });
    if (String(order.userId || '') !== String(req.user._id || req.user.id || '')) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền hủy đơn này' });
    }

    // Nếu đã có mã GHN hoặc đã chuyển giao cho shipper thì từ chối (yêu cầu admin can thiệp)
    if (order.ghnOrderCode) {
      return res.status(400).json({ success: false, message: 'Đơn đã được giao cho vận chuyển, vui lòng liên hệ shop để hủy.' });
    }

    const nonCancellable = ['DELIVERING', 'COMPLETED', 'CANCELLED'];
    if (nonCancellable.includes((order.status || '').toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Đơn hàng không thể hủy ở trạng thái hiện tại.' });
    }

    addUniqueHistory(order, 'cancelled', 'Khách hàng đã hủy đơn hàng');
    order.status = 'CANCELLED';
    await order.save();

    if (req.user) {
      await activityController.createLog(
        req.user.id,
        'Hủy đơn (khách)',
        `Khách hàng đã hủy đơn ${order._id}`,
        req,
      );
    }

    return res.json({ success: true, message: 'Đã hủy đơn hàng thành công', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin hủy đơn (cố gắng hủy trên GHN nếu có mã, nhưng không block nếu GHN lỗi)
exports.adminCancel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    let ghnError = null;
    try {
      if (order.ghnOrderCode) {
        await ghn.cancelGHNOrder(req.params.id);
      }
    } catch (err) {
      ghnError = err.message || err;
      console.error('GHN cancel failed:', ghnError);
    }

    addUniqueHistory(order, 'cancelled', `Đơn hàng đã bị hủy bởi admin`);
    order.status = 'CANCELLED';
    await order.save();

    if (req.user) {
      await activityController.createLog(
        req.user.id,
        'Hủy đơn (admin)',
        `Admin đã hủy đơn ${order._id}${ghnError ? ' (GHN lỗi: ' + ghnError + ')' : ''}`,
        req,
      );
    }

    return res.json({ success: true, message: ghnError ? `Đã hủy đơn nhưng GHN lỗi: ${ghnError}` : 'Đã hủy đơn thành công', ghnError, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
