const Order = require("../models/Order");
const Product = require("../models/Product");
const Promotion = require("../models/Promotion");
const Notification = require("../models/Notification");
const ghn = require("./ghnController");
const activityController = require("./activityController");
const WalletTransaction = require("../models/WalletTransaction");

const addUniqueHistory = (order, status, desc) => {
  const normalizedStatus = status.toLowerCase()
  const isExisted = order.trackingHistory.find((h) => h.status.toLowerCase() === normalizedStatus || h.desc === desc)
  if (!isExisted) {
    order.trackingHistory.push({
      status: normalizedStatus,
      desc: desc,
      time: new Date(),
    })
    return true
  }
  return false
}

// 1. Khách đặt hàng: CHỈ lưu vào DB, trạng thái PENDING
exports.createOrder = async (req, res) => {
  try {
    const { customerInfo, items, totalPrice, paymentMethod, userId, promoCode, shippingInfo } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống!' })
    }

    // Nếu có mã giảm giá, tăng số lượt đã sử dụng trong DB
    if (promoCode) {
      await Promotion.findOneAndUpdate({ code: promoCode.toUpperCase() }, { $inc: { usedCount: 1 } })
    }

    // Tính subtotal từ items
    const subtotalFromItems = items.reduce((sum, it) => {
      const price = Number(it.price || it.unitPrice || 0) || 0
      const qty = Number(it.quantity || it.qty || 1) || 0
      return sum + price * qty
    }, 0)

    const newOrder = new Order({
      userId,
      customerInfo,
      items,
      totalPrice: subtotalFromItems,
      paymentMethod,
      promoCode: promoCode || null,
      status: 'PENDING',
      trackingHistory: [
        {
          status: 'pending',
          desc: promoCode ? `Đơn hàng đã đặt thành công (Mã: ${promoCode})` : 'Đơn hàng đã được đặt thành công',
          time: new Date(),
        },
      ],
    })

    // shipping defaults
    let shippingFeeValue = 0

    if (shippingInfo && typeof shippingInfo.shippingFee !== "undefined") {
      shippingFeeValue = Number(shippingInfo.shippingFee) || 0;
      newOrder.shipping.shippingFee = shippingFeeValue;
      if (shippingInfo.shippingPaidBy)
        newOrder.shipping.shippingPaidBy = shippingInfo.shippingPaidBy;
      newOrder.shipping.shippingAddressStructured = {
        province: typeof shippingInfo.province === 'string' ? { name: shippingInfo.province, id: shippingInfo.to_province_id } : shippingInfo.province || {},
        district: typeof shippingInfo.district === 'string' ? { name: shippingInfo.district, id: shippingInfo.to_district_id } : shippingInfo.district || {},
        ward: typeof shippingInfo.ward === 'string' ? { name: shippingInfo.ward, code: shippingInfo.to_ward_code } : shippingInfo.ward || {},
        detail: shippingInfo.detail || customerInfo.address || '',
      }
      newOrder.shipping.shippingWeight = shippingInfo.weight || undefined
      newOrder.shipping.shippingDimensions = {
        length: shippingInfo.length || 0,
        width: shippingInfo.width || 0,
        height: shippingInfo.height || 0,
      }
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
        const ghnService = require("../services/ghnService");
        const feeRes = await ghnService.calculateFee(feeBody);
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
        newOrder.shipping.shippingFee = shippingFeeValue
        newOrder.shipping.shippingWeight = shippingInfo.weight
        newOrder.shipping.shippingDimensions = {
          length: shippingInfo.length || 0,
          width: shippingInfo.width || 0,
          height: shippingInfo.height || 0,
        }
        newOrder.shipping.shippingAddressStructured = {
          province: typeof shippingInfo.province === 'string' ? { name: shippingInfo.province, id: shippingInfo.to_province_id } : shippingInfo.province || {},
          district: typeof shippingInfo.district === 'string' ? { name: shippingInfo.district, id: shippingInfo.to_district_id } : shippingInfo.district || {},
          ward: typeof shippingInfo.ward === 'string' ? { name: shippingInfo.ward, code: shippingInfo.to_ward_code } : shippingInfo.ward || {},
          detail: shippingInfo.detail || customerInfo.address || '',
        }
      } catch (feeErr) {
        console.error('GHN fee lookup failed:', feeErr.message || feeErr)
      }
    }

    // compute final total (subtotal + shipping)
    const computedTotal = subtotalFromItems + (shippingFeeValue || 0)

    if (
      Number(totalPrice) &&
      Math.abs(Number(totalPrice) - computedTotal) < 10
    ) {
      newOrder.totalPrice = Number(totalPrice);
    } else {
      newOrder.totalPrice = computedTotal
    }

    // ensure shipping fee is persisted (default 0 if not set)
    newOrder.shipping.shippingFee = Number(
      newOrder.shipping.shippingFee || shippingFeeValue || 0,
    );

    // --- INTEGRATED STOCK DEDUCTION (ATOMIC UPDATES) ---
    const deductedItems = []
    let hasStockError = false
    let errorMessage = ''

    for (const item of items) {
      const pIdRaw = item.id || item._id
      if (!pIdRaw) continue

      // Extract real _id if it's a composite ID (e.g. "productID-variantLabel")
      const pId = String(pIdRaw).split("-")[0];

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: pId, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true },
      );

      if (!updatedProduct) {
        hasStockError = true
        errorMessage = `Rất tiếc! Sản phẩm "${item.name}" đã hết hàng hoặc không đủ số lượng.`
        break
      } else {
        deductedItems.push(item)
      }
    }

    if (hasStockError) {
      for (const dItem of deductedItems) {
        const pIdRaw = dItem.id || dItem._id;
        const pId = String(pIdRaw).split("-")[0];
        await Product.findByIdAndUpdate(pId, {
          $inc: { quantity: dItem.quantity },
        });
      }
      return res.status(400).json({ success: false, message: errorMessage })
    }

    const User = require("../models/User");
    let walletDeducted = false;

    // --- LOGIC THANH TOÁN BẰNG VÍ ---
    if (paymentMethod === "WALLET") {
      try {
        if (!userId) {
          throw new Error("Vui lòng đăng nhập để sử dụng ví!");
        }

        const user = await User.findById(userId);
        if (!user || (user.walletBalance || 0) < newOrder.totalPrice) {
          throw new Error("Số dư ví không đủ để thanh toán đơn hàng này!");
        }

        // Thực hiện trừ tiền ví
        await User.findByIdAndUpdate(userId, {
          $inc: { walletBalance: -newOrder.totalPrice },
        });
        walletDeducted = true;

        // Lưu lịch sử giao dịch ví
        await WalletTransaction.create({
          userId: user._id,
          amount: newOrder.totalPrice,
          type: "PAYMENT",
          status: "SUCCESS",
          vnp_TxnRef: `PAY_${newOrder._id.toString().slice(-6)}_${Date.now()}`,
          description: `Thanh toán đơn hàng #${newOrder._id.toString().slice(-6).toUpperCase()}`,
        });

        // Tự động chuyển trạng thái đơn hàng sang "Đã xác nhận"
        newOrder.status = "CONFIRMED";
        newOrder.trackingHistory.push({
          status: "confirmed",
          desc: "Thanh toán qua ví thành công. Đơn hàng đã được xác nhận tự động.",
          time: new Date(),
        });
      } catch (walletError) {
        // Hoàn lại kho nếu lỗi ví
        for (const dItem of deductedItems) {
          const pId = String(dItem.id || dItem._id).split("-")[0];
          await Product.findByIdAndUpdate(pId, {
            $inc: { quantity: dItem.quantity },
          });
        }
        return res
          .status(400)
          .json({ success: false, message: walletError.message });
      }
    }

    try {
      await newOrder.save()
      const notif = new Notification({
        type: 'admin',
        message: `Đơn hàng mới: ${newOrder.totalPrice.toLocaleString()}đ`,
        orderId: newOrder._id,
        link: `/order-tracking/${newOrder._id}`,
      });
      await notif.save();

      const io = req.app.get("io");
      if (io) {
        io.emit('new_order', notif)
      }
    } catch (saveError) {
      // Hoàn lại kho
      for (const dItem of deductedItems) {
        const pIdRaw = dItem.id || dItem._id;
        const pId = String(pIdRaw).split("-")[0];
        await Product.findByIdAndUpdate(pId, {
          $inc: { quantity: dItem.quantity },
        });
      }
      // Hoàn lại ví nếu đã trừ
      if (walletDeducted) {
        await User.findByIdAndUpdate(userId, {
          $inc: { walletBalance: newOrder.totalPrice },
        });
        // Có thể cần xóa/cập nhật WalletTransaction ở đây nhưng đơn giản nhất là báo lỗi
      }
      throw saveError;
    }
    // ----------------------------------------------------

    // Ghi log hoạt động đặt hàng
    try {
      await activityController.createLog(
        userId,
        'Đặt đơn hàng',
        `Người dùng đã đặt đơn hàng mới mã ${newOrder._id.toString().slice(-8).toUpperCase()} trị giá ${newOrder.totalPrice.toLocaleString()}đ`,
        req,
      )
    } catch (err) {
      console.error('Lỗi ghi log hoạt động khi tạo đơn hàng:', err)
    }

    return res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      orderId: newOrder._id,
    })
  } catch (error) {
    console.error('Lỗi createOrder:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// 2. Admin: Xác nhận đơn hàng
exports.adminConfirm = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })

    addUniqueHistory(order, 'confirmed', 'Hệ thống đã xác nhận đơn hàng')
    order.status = 'CONFIRMED'
    await order.save()

    if (req.user) {
      await activityController.createLog(req.user.id, 'Xác nhận đơn hàng', `Đã xác nhận đơn hàng: ${order._id}`, req)
    }

    const notif = new Notification({
      userId: order.userId,
      type: 'user',
      message: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()} của bạn đã được xác nhận`,
      orderId: order._id,
      link: `/order-tracking/${order._id}`,
    })
    await notif.save()

    // Thông báo cho Admin
    const adminNotif = new Notification({
      type: 'admin',
      message: `🎯 Đã xác nhận đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`,
      orderId: order._id,
      link: `/order-tracking/${order._id}`,
    })
    await adminNotif.save()

    const io = req.app.get('io')
    if (io) {
      io.emit('order_status_updated', notif)
      io.emit('new_order', adminNotif)
    }

    res.json({
      success: true,
      message: "Đã xác nhận đơn hàng thành công",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// 3. Admin: Đóng gói sản phẩm
exports.adminPacking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })

    addUniqueHistory(order, 'packing', 'Shop đang chuẩn bị hàng và đóng gói')
    order.status = 'PACKING'
    await order.save()

    if (req.user) {
      await activityController.createLog(req.user.id, 'Đóng gói đơn hàng', `Đã đóng gói đơn hàng: ${order._id}`, req)
    }

    const notif = new Notification({
      userId: order.userId,
      type: 'user',
      message: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()} của bạn đang được đóng gói`,
      orderId: order._id,
      link: `/order-tracking/${order._id}`,
    })
    await notif.save()

    // Thông báo cho Admin
    const adminNotif = new Notification({
      type: 'admin',
      message: `📦 ĐANG ĐÓNG GÓI đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`,
      orderId: order._id,
      link: `/order-tracking/${order._id}`,
    })
    await adminNotif.save()

    const io = req.app.get('io')
    if (io) {
      io.emit('order_status_updated', notif)
      io.emit('new_order', adminNotif)
    }

    res.json({ success: true, message: 'Đã đóng gói thành công', order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// 4. Admin: BÀN GIAO CHO SHIPPER
exports.adminHandover = async (req, res) => {
  try {
    const orderId = req.params.id

    let ghnError = null
    try {
      await ghn.createGHNOrder(orderId)
    } catch (err) {
      ghnError = err.message || 'GHN API failed'
      console.error('❌ GHN API error (non-blocking):', ghnError)
    }

    const updatedOrder = await Order.findById(orderId)
    if (!updatedOrder) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })

    if (!updatedOrder.ghnOrderCode) {
      updatedOrder.status = 'READY_TO_PICK'
      const orderId8 = updatedOrder._id.toString().slice(-8).toUpperCase()
      const desc = `Đã bàn giao đơn #${orderId8} cho GHN${ghnError ? ' (GHN lỗi: ' + ghnError + ')' : ''}`
      const isExisted = updatedOrder.trackingHistory.find((h) => h.status === 'ready_to_pick')
      if (!isExisted) {
        updatedOrder.trackingHistory.push({
          status: 'ready_to_pick',
          desc,
          time: new Date(),
        })
      }
      await updatedOrder.save()
    }

    const notif = new Notification({
      userId: updatedOrder.userId,
      type: 'user',
      message: `Đơn hàng #${updatedOrder._id.toString().slice(-8).toUpperCase()} đã sẵn sàng để giao cho đơn vị vận chuyển`,
      orderId: updatedOrder._id,
      link: `/order-tracking/${updatedOrder._id}`,
    })
    await notif.save()

    // Thông báo cho Admin
    const adminNotif = new Notification({
      type: 'admin',
      message: `🚚 ĐÃ BÀN GIAO đơn hàng #${updatedOrder._id.toString().slice(-8).toUpperCase()} cho GHN`,
      orderId: updatedOrder._id,
      link: `/order-tracking/${updatedOrder._id}`,
    })
    await adminNotif.save()

    const io = req.app.get('io')
    if (io) {
      io.emit('order_status_updated', notif)
      io.emit('new_order', adminNotif)
    }

    return res.json({
      success: true,
      message: ghnError ? `Đã bàn giao (GHN lỗi: ${ghnError}, trạng thái vẫn được cập nhật)` : 'Đã bàn giao đơn cho GHN',
      order: updatedOrder,
      ghnError: ghnError || null,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.createShipment = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    const force = String(req.query.force || "").toLowerCase() === "true";
    if (order.ghnOrderCode && !force) {
      return res.status(400).json({
        success: false,
        message: "Đã có mã GHN, nếu muốn tạo lại hãy gửi ?force=true",
      });
    }

    if (force) {
      order.ghnOrderCode = undefined
      if (order.shipping) order.shipping.ghnOrderCode = undefined
      await order.save()
    }

    try {
      const code = await ghn.createGHNOrder(orderId);
      const updated = await Order.findById(orderId);
      return res.json({
        success: true,
        message: "Đã tạo đơn giao vận trên GHN",
        ghnOrderCode: updated.ghnOrderCode || code,
        order: updated,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "GHN tạo đơn thất bại",
        error: err.message || err.toString(),
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getGHNInfo = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    if (req.user) {
      const isAdmin = req.user.role === "ADMIN";
      const isShipper = req.user.role === "SHIPPER";
      const isOwner =
        String(order.userId || "") ===
        String(req.user._id || req.user.id || "");
      if (!isAdmin && !isShipper && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền xem thông tin giao vận",
        });
      }
    }

    if (!order.ghnOrderCode)
      return res.json({
        success: true,
        message: "Không có mã GHN",
        ghnOrderCode: null,
        order,
      });

    const ghnInfo = await ghn.getGHNTracking(order.ghnOrderCode);
    return res.json({
      success: true,
      ghnInfo,
      ghnOrderCode: order.ghnOrderCode,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getOrderDetail = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });

    if (order.ghnOrderCode) {
      const ghnInfo = await ghn.getGHNTracking(order.ghnOrderCode)
      if (ghnInfo && ghnInfo.status) {
        const ghnStatus = ghnInfo.status.toLowerCase()
        const statusMap = {
          ready_to_pick: 'Shipper đang đến lấy hàng',
          picking: 'Shipper đã lấy hàng thành công và đang chuyển về bưu cục',
          storing: 'Đơn hàng đã nhập kho tập kết Mega SOC',
          delivering: 'Đơn hàng đang trên đường giao đến bạn',
          delivered: 'Giao hàng thành công! Cảm ơn bạn.',
        }

        const changed = addUniqueHistory(order, ghnStatus, statusMap[ghnStatus] || ghnStatus)
        if (changed) {
          if (ghnStatus !== 'storing') order.status = ghnStatus.toUpperCase()
          await order.save()
        }
      }
    }
    order.trackingHistory.sort((a, b) => new Date(b.time) - new Date(a.time))
    res.json({ success: true, order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.shipperUpdateStatus = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(400)
        .json({ success: false, message: "Đơn hàng không hợp lệ" });

    const advanceLocalStatus = () => {
      const currentStatus = (order.status || "").toUpperCase();
      let d = "";

      // --- QUY TRÌNH GIAO HÀNG (GIỮ NGUYÊN) ---
      if (currentStatus === "READY_TO_PICK") {
        order.status = "PICKING";
        d = "Shipper đã lấy hàng thành công và đang chuyển về bưu cục";
      } else if (currentStatus === "PICKING") {
        order.status = "STORING";
        d = "Đơn hàng đã nhập kho tập kết Mega SOC";
      } else if (currentStatus === "STORING") {
        order.status = "DELIVERING";
        d = "Shipper đang trên đường giao hàng đến bạn";
      } else if (currentStatus === "DELIVERING") {
        order.status = "COMPLETED";
        d = "Giao hàng thành công! Người nhận đã ký xác nhận.";
      }

      // --- QUY TRÌNH HOÀN TRẢ (THÊM MỚI Ở ĐÂY) ---
      else if (currentStatus === "RETURN_REQUESTED") {
        order.status = "RETURN_PICKING";
        d = "Shipper đã lấy hàng hoàn từ khách và đang mang trả về Shop.";
      } else if (currentStatus === "RETURN_PICKING") {
        order.status = "READY_TO_RETURN";
        d =
          "Hàng hoàn đã về tới cửa hàng. Đang chờ Admin kiểm tra và hoàn tiền.";
      } else {
        return { ok: false }
      }

      addUniqueHistory(order, order.status.toLowerCase(), d);
      return { ok: true, desc: d };
    };

    const { ok, desc } = advanceLocalStatus();
    if (!ok)
      return res.status(400).json({
        success: false,
        message: "Trạng thái này Shipper không thể cập nhật thêm",
      });

    await order.save();

    // Gửi thông báo cho khách hàng về hành trình mới
    const notif = new Notification({
      userId: order.userId,
      type: "user",
      message: desc,
      orderId: order._id,
      link: `/order-tracking/${order._id}`,
    });
    await notif.save();

    // Bổ sung thông báo cho Admin khi shipper cập nhật trạng thái
    const adminNotif = new Notification({
      type: "admin",
      message: `Đơn #${order._id.toString().slice(-8).toUpperCase()}: ${desc}`,
      orderId: order._id,
      link: `/order-tracking/${order._id}`
    });
    await adminNotif.save();

    const io = req.app.get("io");
    if (io) {
      io.emit('order_status_updated', notif)
      io.emit('new_order', adminNotif)
    }

    return res.json({
      success: true,
      message: "Cập nhật hành trình thành công!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getAllOrders = async (req, res) => {
  try {
    const { status, minAmount, maxAmount, productName, startDate, endDate } = req.query;
    let query = {};

    // Lọc theo trạng thái
    if (status && status !== "ALL") {
      query.status = status.toUpperCase();
    }

    // Lọc theo khoảng giá
    if (minAmount || maxAmount) {
      query.totalPrice = {};
      if (minAmount) query.totalPrice.$gte = Number(minAmount);
      if (maxAmount) query.totalPrice.$lte = Number(maxAmount);
    }

    // Lọc theo tên sản phẩm (trong mảng items)
    if (productName) {
      query["items.name"] = { $regex: productName, $options: "i" };
    }

    // Lọc theo thời gian
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Hết ngày
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (updated && req.user) {
      await activityController.createLog(
        req.user.id,
        "Cập nhật đơn hàng",
        `Đã cập nhật trạng thái đơn hàng ${updated._id} thành ${status}`,
        req,
      );
    }

    let notif = null;
    if (updated) {
      const statusLabels = {
        PENDING: "Đang chờ xử lý",
        CONFIRMED: "Đã xác nhận",
        PACKING: "Đang đóng gói",
        READY_TO_PICK: "Chờ lấy hàng",
        PICKING: "Đang lấy hàng",
        DELIVERING: "Đang giao hàng",
        COMPLETED: "Hoàn tất",
        CANCELLED: "Đã hủy",
      };

      notif = new Notification({
        userId: updated.userId,
        type: 'user',
        message: `Đơn hàng #${updated._id.toString().slice(-8).toUpperCase()} đã cập nhật trạng thái: ${statusLabels[status.toUpperCase()] || status}`,
        orderId: updated._id,
        link: `/order-tracking/${updated._id}`,
      });
      await notif.save();

      // Bổ sung cho Admin
      const adminNotif = new Notification({
        type: 'admin',
        message: `Đơn #${updated._id.toString().slice(-8).toUpperCase()}: ${statusLabels[status.toUpperCase()] || status}`,
        orderId: updated._id,
        link: `/order-tracking/${updated._id}`
      });
      await adminNotif.save();

      const io = req.app.get("io");
      if (io) {
        io.emit('order_status_updated', notif)
        io.emit('new_order', adminNotif)
      }
      }

    res.json({ success: true, message: 'Cập nhật trạng thái thành công' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.userCancel = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "Yêu cầu đăng nhập" });
    if (
      String(order.userId || "") !== String(req.user._id || req.user.id || "")
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không có quyền hủy đơn này" });
    }
    if (order.ghnOrderCode) {
      return res.status(400).json({
        success: false,
        message:
          "Đơn đã được giao cho vận chuyển, vui lòng liên hệ shop để hủy.",
      });
    }
    const nonCancellable = ["DELIVERING", "COMPLETED", "CANCELLED"];
    if (nonCancellable.includes((order.status || "").toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng không thể hủy ở trạng thái hiện tại.",
      });
    }

    order.cancelReason = reason || "Không có lý do cụ thể";
    addUniqueHistory(
      order,
      "cancelled",
      `Khách hàng đã hủy đơn hàng. Lý do: ${order.cancelReason}`,
    );
    order.status = "CANCELLED";
    await order.save();
    if (req.user) {
      await activityController.createLog(
        req.user.id,
        "Hủy đơn (khách)",
        `Khách hàng đã hủy đơn ${order._id}`,
        req,
      );
    }
    return res.json({
      success: true,
      message: "Đã hủy đơn hàng thành công",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.adminCancel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    let ghnError = null;
    try {
      if (order.ghnOrderCode) {
        await ghn.cancelGHNOrder(req.params.id)
      }
    } catch (err) {
      ghnError = err.message || err
    }
    addUniqueHistory(order, "cancelled", `Đơn hàng đã bị hủy bởi admin`);
    order.status = "CANCELLED";
    await order.save();
    if (req.user) {
      await activityController.createLog(
        req.user.id,
        "Hủy đơn (admin)",
        `Admin đã hủy đơn ${order._id}${ghnError ? " (GHN lỗi: " + ghnError + ")" : ""}`,
        req,
      );
    }

    const notif = new Notification({
      userId: order.userId,
      type: 'user',
      message: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()} của bạn đã bị hủy`,
      orderId: order._id,
      link: `/order-tracking/${order._id}`,
    });
    await notif.save();

    const io = req.app.get("io");
    if (io) io.emit("order_status_updated", notif);

    return res.json({
      success: true,
      message: ghnError
        ? `Đã hủy đơn nhưng GHN lỗi: ${ghnError}`
        : "Đã hủy đơn thành công",
      ghnError,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Chỉ đơn hàng đã hoàn tất mới có thể hoàn hàng",
      });
    }
    order.status = "RETURN_REQUESTED";
    addUniqueHistory(
      order,
      "return_requested",
      "Khách hàng yêu cầu hoàn trả hàng.",
    );
    await order.save();
    res.json({ success: true, message: "Đã gửi yêu cầu hoàn hàng" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.adminConfirmReturned = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Không thấy đơn hàng" });

    // 1. CỘNG TIỀN VÀO VÍ KHÁCH HÀNG
    const User = require("../models/User"); // Đảm bảo import User model ngay tại đây

    // Tìm người dùng sở hữu đơn hàng này
    const user = await User.findById(order.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản khách hàng để hoàn tiền",
      });
    }

    // Thực hiện cộng tiền trực tiếp vào Database
    await User.findByIdAndUpdate(order.userId, {
      $inc: { walletBalance: order.totalPrice }, // Dùng $inc để cộng dồn tiền chính xác
    });

    // 2. LƯU LỊCH SỬ GIAO DỊCH VÍ (Để khách xem trong Lịch sử ví)
    await WalletTransaction.create({
      userId: order.userId,
      amount: order.totalPrice,
      type: "REFUND",
      status: "SUCCESS",
      vnp_TxnRef: `REFUND_${order._id.toString().slice(-6)}`,
      description: `Hoàn tiền đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`,
    });

    // 3. HOÀN LẠI SỐ LƯỢNG VÀO KHO
    for (const item of order.items) {
      const pId = String(item.id || item._id).split("-")[0];
      await Product.findByIdAndUpdate(pId, {
        $inc: { quantity: item.quantity },
      });
    }

    // 4. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG THÀNH "RETURNED"
    order.status = "RETURNED";
    addUniqueHistory(
      order,
      "returned",
      "Hệ thống đã hoàn tiền vào ví của bạn.",
    );
    await order.save();

    res.json({
      success: true,
      message: "Đã xác nhận nhận hàng & Hoàn tiền thành công!",
    });
  } catch (error) {
    console.error("Lỗi hoàn trả:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
