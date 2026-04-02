const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Get all notifications for current user (or admin)
router.get("/", verifyToken, notificationController.getNotifications);

// Mark a single notification as read
router.put("/:id/read", verifyToken, notificationController.markAsRead);

// Mark all as read
router.put("/read-all", verifyToken, notificationController.markAllAsRead);

module.exports = router;
