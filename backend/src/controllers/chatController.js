const ChatMessage = require("../models/ChatMessage");
const mongoose = require('mongoose');

exports.getConversation = async (req, res) => {
  const { conversationId } = req.params;
  const excludeAI = req.query.excludeAI === 'true';
  if (!conversationId) {
    return res.status(400).json({ success: false, message: "Missing conversationId" });
  }

  try {
    const query = { conversationId };
    if (excludeAI) {
      const nor = [ { isAI: true }, { senderRole: 'ai' } ];
      if (process.env.AI_SENDER_ID) {
        try {
          nor.push({ senderId: mongoose.Types.ObjectId(process.env.AI_SENDER_ID) });
        } catch (e) {}
      }
      query.$nor = nor;
    }

    const messages = await ChatMessage.find(query).sort({ createdAt: 1 }).lean();
    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.markRead = async (req, res) => {
  const { conversationId } = req.params;
  try {
    // only mark non-AI messages as read when admin opens conversation
    await ChatMessage.updateMany({ conversationId, isAI: { $ne: true } }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const pipeline = [];

    // Exclude AI-only conversations and clearly AI-generated messages using $expr
    // This is more reliable inside aggregation pipelines.
    pipeline.push({
      $match: {
        $expr: {
          $and: [
            { $ne: [{ $substrCP: ["$conversationId", 0, 3] }, "ai:"] },
            { $ne: ["$isAI", true] },
            { $ne: ["$senderRole", "ai"] },
          ],
        },
      },
    });

    // Also exclude messages coming from a configured AI sender id (older records)
    if (process.env.AI_SENDER_ID) {
      try {
        pipeline.unshift({ $match: { senderId: { $ne: mongoose.Types.ObjectId(process.env.AI_SENDER_ID) } } });
      } catch (e) {
        // invalid id, ignore
      }
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$content" },
          lastAt: { $first: "$createdAt" },
          lastSenderRole: { $first: "$senderRole" },
          unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$read", false] }, { $ne: ["$senderRole", "admin"] }, { $ne: ["$isAI", true] }] }, 1, 0] } },
        },
      },
      // conversationId may be like "user:<id>" or "ai:user:<id>".
      // Extract the last segment after ':' (the actual user id) and
      // attempt a safe convert to ObjectId using $convert with onError.
      {
        $addFields: {
          userIdStr: { $last: { $split: ["$_id", ":"] } },
        },
      },
      {
        $addFields: {
          userObjectId: {
            $convert: { input: "$userIdStr", to: "objectId", onError: null, onNull: null },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userObjectId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          conversationId: "$_id",
          lastMessage: 1,
          lastAt: 1,
          lastSenderRole: 1,
          unreadCount: 1,
          user: { _id: "$user._id", fullName: "$user.fullName", email: "$user.email", avatar: "$user.avatar" },
        },
      },
      { $sort: { lastAt: -1 } },
    );

    const agg = await ChatMessage.aggregate(pipeline);

    res.json({ success: true, conversations: agg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
