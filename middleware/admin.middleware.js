module.exports = (reg,res,next) => {
    if (reg.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
    }
    next();
}