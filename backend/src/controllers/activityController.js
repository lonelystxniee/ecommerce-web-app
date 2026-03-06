const ActivityLog = require("../models/ActivityLog");

// Helper function to create a log
exports.createLog = async (userId, action, details, req) => {
    try {
        const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const userAgent = req.headers["user-agent"];

        await ActivityLog.create({
            userId,
            action,
            details,
            ipAddress,
            userAgent,
        });
    } catch (error) {
        console.error("❌ LỖI GHI LOG HOẠT ĐỘNG:", error.message);
    }
};

exports.getActivities = async (req, res) => {
    try {
        const userId = req.user.id;
        const activities = await ActivityLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            activities,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
