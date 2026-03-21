module.exports = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Quyền truy cập bị từ chối. Chỉ dành cho Quản trị viên!" });
    }
    next();
}