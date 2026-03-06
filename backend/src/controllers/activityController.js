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

// Admin function to get all activities
exports.getAllActivities = async (req, res) => {
    try {
        const { q, action, sort } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = {};

        // Filter by action
        if (action) {
            query.action = action;
        }

        // Search logic
        if (q) {
            // Since we need to search by user name/email, we first find users matching the term
            const User = require("../models/User"); // Dynamic require to avoid circular dep if any
            const matchingUsers = await User.find({
                $or: [
                    { name: { $regex: q, $options: "i" } },
                    { email: { $regex: q, $options: "i" } }
                ]
            }).select("_id");

            const userIds = matchingUsers.map(u => u._id);

            query.$or = [
                { action: { $regex: q, $options: "i" } },
                { details: { $regex: q, $options: "i" } },
                { userId: { $in: userIds } }
            ];
        }

        // Sort logic
        let sortOption = { createdAt: -1 };
        if (sort === "oldest") sortOption = { createdAt: 1 };

        const [activities, total] = await Promise.all([
            ActivityLog.find(query)
                .populate("userId", "name email")
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            ActivityLog.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            activities,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
