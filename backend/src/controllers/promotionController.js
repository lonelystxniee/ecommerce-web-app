const Promotion = require('../models/Promotion')

// 1. Lấy tất cả mã (Admin)
exports.getAll = async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 })
    res.json({ success: true, promos })
  } catch (error) {
    res.status(500).json({ success: false })
  }
}

// 2. Tạo mã mới
exports.create = async (req, res) => {
  try {
    const newPromo = new Promotion(req.body)
    await newPromo.save()
    res.json({ success: true, message: 'Tạo thành công' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Mã đã tồn tại hoặc dữ liệu lỗi' })
  }
}

// 3. Cập nhật mã (Admin) - MỚI
exports.update = async (req, res) => {
  try {
    await Promotion.findByIdAndUpdate(req.params.id, req.body)
    res.json({ success: true, message: 'Cập nhật thành công' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật' })
  }
}

// 4. Xóa mã (Admin) - MỚI
exports.delete = async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Đã xóa mã giảm giá' })
  } catch (error) {
    res.status(500).json({ success: false })
  }
}

// 5. Kiểm tra mã (User áp dụng) - CẬP NHẬT LOGIC GIỚI HẠN
exports.checkCode = async (req, res) => {
  try {
    const { code, orderValue } = req.body
    const promo = await Promotion.findOne({ code, status: 'ACTIVE' })

    if (!promo)
      return res.status(404).json({ success: false, message: 'Mã không tồn tại hoặc đã bị khóa' })

    // Kiểm tra ngày hết hạn
    if (new Date() > promo.endDate)
      return res.status(400).json({ success: false, message: 'Mã đã hết hạn sử dụng' })

    // Kiểm tra giới hạn số lượng - MỚI
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'Mã đã hết lượt sử dụng' })
    }

    // Kiểm tra giá trị đơn tối thiểu
    if (orderValue < promo.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${promo.minOrderValue.toLocaleString()}đ để dùng mã này`,
      })
    }

    let discountAmount = 0
    if (promo.discountType === 'AMOUNT') {
      discountAmount = promo.discountValue
    } else {
      discountAmount = (orderValue * promo.discountValue) / 100
      if (promo.maxDiscount && discountAmount > promo.maxDiscount)
        discountAmount = promo.maxDiscount
    }

    res.json({ success: true, discountAmount, code: promo.code })
  } catch (error) {
    res.status(500).json({ success: false })
  }
}

// 6. Lấy các mã đang chạy Banner/Popup (User)
exports.getActiveBanner = async (req, res) => {
  try {
    const activePromos = await Promotion.find({
      status: 'ACTIVE',
      $or: [{ isBannerActive: true }, { isPopupActive: true }],
      endDate: { $gt: new Date() },
    }).sort({ updatedAt: -1 })

    res.json({ success: true, promos: activePromos })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
