const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Tạm thời bỏ qua xác thực để test API
  req.user = { role: "ADMIN" };
  next();
};

module.exports = { verifyToken };
