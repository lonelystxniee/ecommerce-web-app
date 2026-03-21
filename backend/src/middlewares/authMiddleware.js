const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    logger.auth('[authMiddleware] Authorization header:', authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Không tìm thấy token xác thực!" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Người dùng không tồn tại!" });
    }

    logger.auth('[authMiddleware] Resolved user id:', user._id.toString(), 'role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    logger.error("Auth Middleware Error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

module.exports = { verifyToken };
