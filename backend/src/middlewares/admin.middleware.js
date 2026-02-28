module.exports = (req, res, next) => {
    // Tạm thời bỏ qua check role để test
    // if (req.user.role !== "ADMIN") {
    //     return res.status(403).json({ message: "Admin only" });
    // }
    next();
}