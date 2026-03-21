const Promotion = require("../models/Promotion");
const User = require("../models/User");

// 1. Lấy tất cả mã (Admin)
exports.getAll = async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 });
    res.json({ success: true, promos });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// 2. Tạo mã mới
exports.create = async (req, res) => {
  try {
    const newPromo = new Promotion(req.body);
    await newPromo.save();
    res.json({ success: true, message: "Tạo thành công" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Mã đã tồn tại hoặc dữ liệu lỗi" });
  }
};

// 3. Cập nhật mã (Admin) - MỚI
exports.update = async (req, res) => {
  try {
    await Promotion.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật" });
  }
};

// 4. Xóa mã (Admin) - MỚI
exports.delete = async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xóa mã giảm giá" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// 5. Kiểm tra mã (User áp dụng) - CẬP NHẬT LOGIC GIỚI HẠN
exports.checkCode = async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    const promo = await Promotion.findOne({ code, status: "ACTIVE" });

    if (!promo)
      return res
        .status(404)
        .json({ success: false, message: "Mã không tồn tại hoặc đã bị khóa" });

    // Kiểm tra ngày hết hạn
    if (new Date() > promo.endDate)
      return res
        .status(400)
        .json({ success: false, message: "Mã đã hết hạn sử dụng" });

    // Kiểm tra giới hạn số lượng - MỚI
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res
        .status(400)
        .json({ success: false, message: "Mã đã hết lượt sử dụng" });
    }

    // Kiểm tra giá trị đơn tối thiểu
    if (orderValue < promo.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${promo.minOrderValue.toLocaleString()}đ để dùng mã này`,
      });
    }

    let discountAmount = 0;
    if (promo.discountType === "AMOUNT") {
      discountAmount = promo.discountValue;
    } else {
      discountAmount = (orderValue * promo.discountValue) / 100;
      if (promo.maxDiscount && discountAmount > promo.maxDiscount)
        discountAmount = promo.maxDiscount;
    }

    res.json({ success: true, discountAmount, code: promo.code });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// 6. Lấy các mã đang chạy Banner/Popup (User)
exports.getActiveBanner = async (req, res) => {
  try {
    const activePromos = await Promotion.find({
      status: "ACTIVE",
      $or: [{ isBannerActive: true }, { isPopupActive: true }],
      endDate: { $gt: new Date() },
    }).sort({ updatedAt: -1 });

    res.json({ success: true, promos: activePromos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy trạng thái lượt quay & Reset theo ngày
exports.getSpinStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date().setHours(0, 0, 0, 0);

    const lastSpin = user.lastSpinDate
      ? new Date(user.lastSpinDate).setHours(0, 0, 0, 0)
      : null;
    const lastMiniGame = user.lastMiniGameDate
      ? new Date(user.lastMiniGameDate).setHours(0, 0, 0, 0)
      : null;

    // Reset lượt quay free mỗi ngày nếu đã qua ngày mới
    if (lastSpin !== today) {
      user.availableSpins = Math.max(user.availableSpins, 1);
      // Lưu ý: Không cập nhật lastSpinDate ở đây, chỉ cập nhật khi họ thực sự nhấn Quay
      await user.save();
    }

    res.json({
      success: true,
      availableSpins: user.availableSpins,
      canPlayMiniGame: lastMiniGame !== today, // Trả về true nếu hôm nay chưa chơi
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Trừ lượt khi quay
exports.useSpin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.availableSpins <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã hết lượt quay hôm nay!" });
    }

    user.availableSpins -= 1;
    user.lastSpinDate = new Date(); // Đánh dấu ngày đã quay
    await user.save();
    res.json({ success: true, remainingSpins: user.availableSpins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Cộng lượt khi thắng Mini Game (Giới hạn 1 lần/ngày)
exports.addSpin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date().setHours(0, 0, 0, 0);
    const lastMiniGame = user.lastMiniGameDate
      ? new Date(user.lastMiniGameDate).setHours(0, 0, 0, 0)
      : null;

    if (lastMiniGame === today) {
      return res.status(400).json({
        success: false,
        message: "Hôm nay bạn đã nhận lượt từ Mini Game rồi!",
      });
    }

    user.availableSpins += 1;
    user.lastMiniGameDate = new Date(); // Đánh dấu ngày đã chơi game
    await user.save();

    res.json({ success: true, availableSpins: user.availableSpins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveWonVoucher = async (req, res) => {
  try {
    const { promoId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.vouchers.includes(promoId)) {
      user.vouchers.push(promoId);
      await user.save();
    }

    res.json({ success: true, message: "Đã lưu voucher" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// Lấy danh sách voucher của tôi
exports.getMyVouchers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("vouchers");
    res.json({
      success: true,
      vouchers: user.vouchers.filter((v) => v.status === "ACTIVE"), // Chỉ lấy mã còn hiệu lực
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
