const Notification = require("../models/Notification");

// Lấy danh sách thông báo
exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    let query = {};
    if (user.role === "ADMIN") {
      // Get all admin notifications OR notifications directly sent to admin. In this system Admin gets 'admin' type.
      query = { type: "admin" };
    } else {
      query = { type: "user", userId: user.id || user._id };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đánh dấu 1 thông báo là đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đánh dấu tất cả là đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const user = req.user;
    let query = {};
    if (user.role === "ADMIN") {
      query = { type: "admin", isRead: false };
    } else {
      query = { type: "user", userId: user.id || user._id, isRead: false };
    }

    await Notification.updateMany(query, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
