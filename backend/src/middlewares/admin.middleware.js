module.exports = (req, res, next) => {
    console.log('[adminMiddleware] req.user:', req.user ? { id: req.user._id ? req.user._id.toString() : null, role: req.user.role } : null);
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Quyền truy cập bị từ chối. Chỉ dành cho Quản trị viên!" });
    }
    next();
}