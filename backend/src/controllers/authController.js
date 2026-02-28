const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Nodemailer transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ email và mật khẩu",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu đã hash và chưa hash cho account cũ)
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    if (!isMatch && String(password) !== String(user.password)) {
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
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email này đã được sử dụng!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ fullName, email, password: hashedPassword, phone });

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

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Thiếu Google Token" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name: fullName, picture: avatar } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: "Không lấy được email từ Google" });
    }

    // Kiểm tra xem user có tồn tại chưa
    let user = await User.findOne({ email });

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = await User.create({
        fullName,
        email,
        authProvider: "GOOGLE",
        googleId,
        avatar,
        status: "ACTIVE",
        role: "CUSTOMER",
      });
      console.log("✅ Đăng ký mới bằng Google thành công cho:", user.email);
    } else {
      // Cập nhật thông tin Google nếu user đã có từ trước nhưng chưa link Google
      if (user.authProvider === "LOCAL" && !user.googleId) {
        user.googleId = googleId;
        user.authProvider = "GOOGLE"; // Hoặc giữ LOCAL nhưng vẫn có googleId, tuỳ quy trình
        if (!user.avatar) user.avatar = avatar;
        await user.save();
      }

      if (user.status === "LOCKED") {
        return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa!" });
      }
      console.log("✅ Đăng nhập Google thành công cho:", user.email);
    }

    // Tạo JWT token cho session của app
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password, resetToken, resetTokenExpiry, ...userInfo } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Đăng nhập Google thành công!",
      token: jwtToken,
      user: userInfo,
    });

  } catch (error) {
    console.error("❌ LỖI ĐĂNG NHẬP GOOGLE:", error.message);
    return res.status(500).json({
      success: false,
      message: "Xác thực Google thất bại",
      error: error.message,
    });
  }
};

exports.facebookLogin = async (req, res) => {
  const { accessToken, userID } = req.body;

  if (!accessToken || !userID) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin từ Facebook" });
  }

  try {
    // 1. Gọi Graph API của Facebook để xác thực token và lấy thông tin user
    // Lưu ý: Cần lấy thêm fields email, name, picture
    const url = `https://graph.facebook.com/v19.0/${userID}?fields=id,name,email,picture.type(large)&access_token=${accessToken}`;
    const fbResponse = await axios.get(url);
    const { id: facebookId, name: fullName, email, picture } = fbResponse.data;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Không lấy được email từ Facebook. Vui lòng kiểm tra quyền truy cập."
      });
    }

    const avatar = picture?.data?.url || "";

    // 2. Kiểm tra xem user có trong DB hay chưa (dựa theo email vì email là duy nhất)
    let user = await User.findOne({ email });

    if (!user) {
      // 3a. Tạo mới User nếu chưa tồn tại
      user = await User.create({
        fullName,
        email,
        authProvider: "FACEBOOK",
        facebookId,
        avatar,
        status: "ACTIVE",
        role: "CUSTOMER",  // hoặc default role nào đó trong hệ thống
      });
      console.log("✅ Đăng ký mới bằng Facebook thành công cho:", user.email);
    } else {
      // 3b. User đã có sẵn trong hệ thống (có thể đki qua LOCAL, hoặc GOOGLE)
      // Cập nhật facebookId nếu chưa có
      if (!user.facebookId) {
        user.facebookId = facebookId;
        // Nếu user này trước đó là LOCAL, ta có thể đổi thành FACEBOOK (tùy nghiệp vụ)
        if (user.authProvider === "LOCAL") {
          user.authProvider = "FACEBOOK";
        }
        if (!user.avatar && avatar) user.avatar = avatar;
        await user.save();
      }

      if (user.status === "LOCKED") {
        return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa!" });
      }
      console.log("✅ Đăng nhập Facebook thành công cho:", user.email);
    }

    // 4. Tạo JWT Token trả về cho Frontend
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Không trả về password và các token secret khác
    const { password, resetToken, resetTokenExpiry, ...userInfo } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Đăng nhập Facebook thành công!",
      token: jwtToken,
      user: userInfo,
    });

  } catch (error) {
    console.error("❌ LỖI ĐĂNG NHẬP FACEBOOK:", error.message);
    return res.status(500).json({
      success: false,
      message: "Xác thực Facebook thất bại",
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
    const updated = await User.findByIdAndUpdate(
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
    const user = await User.findById(userId).select("-password");

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
    const user = await User.findOne({ email });

    if (!user) {
      // Trả về success để không lộ thông tin tài khoản
      return res.status(200).json({
        success: true,
        message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu!",
      });
    }

    // Tạo token ngẫu nhiên
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    // Gửi email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"ClickGo Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Đặt lại mật khẩu - ClickGo",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Xin chào ${user.fullName},</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Nhấn vào nút bên dưới để đặt lại mật khẩu. Link sẽ hết hạn sau <strong>15 phút</strong>.</p>
          <a href="${resetUrl}"
             style="display:inline-block; margin: 16px 0; padding: 12px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Đặt lại mật khẩu
          </a>
          <p style="color: #888; font-size: 13px;">Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
        </div>
      `,
    });

    console.log("✅ Email đặt lại mật khẩu đã gửi tới:", email);

    return res.status(200).json({
      success: true,
      message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu!",
    });
  } catch (error) {
    console.error("❌ LỖI FORGOT PASSWORD:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra tại Server",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Thiếu token hoặc mật khẩu mới",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    });
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // chưa hết hạn
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    console.log("✅ Đặt lại mật khẩu thành công cho:", user.email);

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.",
    });
  } catch (error) {
    console.error("❌ LỖI RESET PASSWORD:", error.message);
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
    const user = await User.findById(userId);

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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Đã xóa người dùng" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm người dùng từ trang Admin
exports.adminCreateUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, status } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại trong hệ thống!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || "CUSTOMER",
      status: status || "ACTIVE",
    });

    res
      .status(201)
      .json({ success: true, message: "Tạo người dùng thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
