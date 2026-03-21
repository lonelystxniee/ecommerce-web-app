const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: "Bạn cần đăng nhập để thực hiện chức năng này!",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Phiên đăng nhập hết hạn hoặc không hợp lệ!",
    });
  }
};

module.exports = { verifyToken };
