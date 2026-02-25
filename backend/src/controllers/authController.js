const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ email và mật khẩu",
    });
  }

  try {
    const user = await Customer.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    if (String(password) !== String(user.password)) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    if (user.status === "LOCKED") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa!",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    console.log("✅ Đăng nhập thành công cho:", user.fullName);

    const { password: _, ...userInfo } = user.toObject();
    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: userInfo,
    });
  } catch (error) {
    console.error("❌ LỖI ĐĂNG NHẬP:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra tại Server",
      error: error.message,
    });
  }
};

exports.register = async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu",
    });
  }

  try {
    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email này đã được sử dụng!",
      });
    }

    const newUser = await Customer.create({ fullName, email, password, phone });

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("❌ LỖI ĐĂNG KÝ:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra tại Server",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullName, phone } = req.body;

  if (!fullName && !phone) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật",
    });
  }

  try {
    const updated = await Customer.findByIdAndUpdate(
      userId,
      { ...(fullName && { fullName }), ...(phone && { phone }) },
      { new: true, select: "-password" },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tài khoản!" });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công!",
      user: updated,
    });
  } catch (error) {
    console.error("❌ LỖI CẬP NHẬT:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra tại Server",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await Customer.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tài khoản!" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("❌ LỖI XEM THÔNG TIN:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra tại Server",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập email" });
  }

  try {
    const user = await Customer.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trong hệ thống!",
      });
    }

    // TODO: Tích hợp gửi email thực tế (nodemailer, SendGrid...)
    return res.status(200).json({
      success: true,
      message:
        "Yêu cầu đặt lại mật khẩu đã được ghi nhận, vui lòng kiểm tra email!",
    });
  } catch (error) {
    console.error("❌ LỖI RESET MẬT KHẨU:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra tại Server",
      error: error.message,
    });
  }
};

exports.lockAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await Customer.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tài khoản!" });
    }

    if (user.status === "LOCKED") {
      return res
        .status(400)
        .json({ success: false, message: "Tài khoản đã bị khóa trước đó!" });
    }

    user.status = "LOCKED";
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Tài khoản đã được khóa thành công!" });
  } catch (error) {
    console.error("❌ LỖI KHÓA TÀI KHOẢN:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra tại Server",
      error: error.message,
    });
  }
};
