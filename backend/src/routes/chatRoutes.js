const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// GET /api/chat/conversation/:conversationId
router.get("/conversation/:conversationId", chatController.getConversation);

// PUT /api/chat/conversation/:conversationId/read
router.put("/conversation/:conversationId/read", chatController.markRead);

// GET /api/chat/conversations
router.get("/conversations", chatController.getConversations);

module.exports = router;
