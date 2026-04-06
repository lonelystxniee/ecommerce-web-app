module.exports = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (req.user.role === 'SHIPPER' || req.user.role === 'ADMIN') return next();
  return res.status(403).json({ success: false, message: 'Only shipper or admin allowed' });
};
