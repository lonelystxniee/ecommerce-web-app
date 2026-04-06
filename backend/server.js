require('dotenv').config()
const express = require('express')
const cors = require('cors')

const connectDB = require('./src/config/db')
const authRoutes = require('./src/routes/authRoutes')
const orderRoutes = require('./src/routes/orderRoutes')
const productRoutes = require('./src/routes/productRoutes')
const categoryRoutes = require('./src/routes/category.routes')
const reviewRoutes = require('./src/routes/reviewRoutes')
const locationRoutes = require('./src/routes/locationRoutes')
const shippingRoutes = require('./src/routes/shippingRoutes')
const addressRoutes = require('./src/routes/addressRoutes')
const adminOrderRoutes = require('./src/routes/adminOrderRoutes')
const adRoutes = require('./src/routes/adRoutes')
const revenueRoutes = require('./src/routes/revenueRoutes')

const app = express()
const http = require('http')
const { Server } = require('socket.io')
const ChatMessage = require('./src/models/ChatMessage')
const jwt = require('jsonwebtoken')
const aiService = require('./src/services/aiService')
const ragService = require('./src/services/ragService')
const walletRoutes = require('./src/routes/walletRoutes')

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://clickgo-shop.netlify.app/',
  'https://admin-clickgo-shop.netlify.app/',
  'https://shipper-clickgo-shop.netlify.app/',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  }),
)

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/products', productRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/promotions', require('./src/routes/promotionRoutes'))
app.use('/api/locations', locationRoutes)
app.use('/api/shipping', shippingRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/wishlist', require('./src/routes/wishlistRoutes'))
app.use('/api/admin/orders', adminOrderRoutes)
app.use('/api/chat', require('./src/routes/chatRoutes'))
// AI routes removed
app.use('/api/ads', adRoutes)
app.use('/api/admin/revenue', revenueRoutes)
app.use('/api/articles', require('./src/routes/articleRoutes'))
app.use('/api/notifications', require('./src/routes/notificationRoutes'))
app.use('/api/wallet', walletRoutes)
const PORT = process.env.PORT || 5175

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  },
})

app.set('io', io) // Export io for controllers to use

// Basic socket handlers for chat
const logger = require('./src/utils/logger')

io.on('connection', (socket) => {
  logger.socket('Socket connected:', socket.id)

  socket.on('join_conversation', ({ conversationId }) => {
    if (conversationId) {
      socket.join(conversationId)
      logger.socket(`Socket ${socket.id} joined ${conversationId}`)
    }
  })

  socket.on('leave_conversation', ({ conversationId }) => {
    if (conversationId) {
      socket.leave(conversationId)
      logger.socket(`Socket ${socket.id} left ${conversationId}`)
    }
  })

  socket.on('send_message', async (payload) => {
    try {
      // payload: { conversationId, senderId, receiverId, senderRole, content }
      // received send_message payload (clientId available for reconciliation)
      const msg = new ChatMessage({
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        receiverId: payload.receiverId,
        senderRole: payload.senderRole || 'customer',
        content: payload.content,
        clientId: payload.clientId,
      })
      await msg.save()
      io.to(payload.conversationId).emit('new_message', msg)
      // broadcast a lightweight conversation change event so clients
      // that are not currently joined to the room (or missed the room)
      // can update their conversation lists / unread badges without refresh
      // Do NOT broadcast global conversation_changed for AI assistant conversations
      // (conversationId prefix "ai:") — these should remain customer<->AI only.
      try {
        if (!(typeof payload.conversationId === 'string' && payload.conversationId.startsWith('ai:'))) {
          socket.broadcast.emit('conversation_changed', {
            conversationId: payload.conversationId,
            senderId: msg.senderId,
          })
        }
      } catch (e) {
        // if any issue evaluating, skip broadcast to be safe
      }

      // If a customer sent the message, forward to AI service and emit AI reply
      try {
        // Only forward to AI when the conversation is an AI conversation
        // (conversationId intentionally uses the `ai:` prefix for AI chats).
        if ((payload.senderRole || 'customer') === 'customer' && payload.content && payload.conversationId && typeof payload.conversationId === 'string' && payload.conversationId.startsWith('ai:')) {
          // Use RAG wrapper to include product/promotion context before calling AI
          let aiText
          try {
            aiText = await ragService.generateWithContext(payload.content, null)
          } catch (ragErr) {
            console.error('RAG failed, falling back to raw AI:', ragErr?.message || ragErr)
            try {
              aiText = await aiService.generateResponse(payload.content)
            } catch (rawErr) {
              console.error('Raw AI fallback failed:', rawErr?.message || rawErr)
              aiText = null
            }
          }
          if (aiText) {
            const aiSenderId = process.env.AI_SENDER_ID || payload.receiverId || payload.senderId
            const aiMsg = new ChatMessage({
              conversationId: payload.conversationId,
              senderId: aiSenderId,
              receiverId: payload.senderId,
              // mark these messages as AI-generated so admin UI can ignore them
              senderRole: 'ai',
              isAI: true,
              content: String(aiText).trim(),
            })
            await aiMsg.save()
            // emit the AI reply only to participants in the conversation room
            io.to(payload.conversationId).emit('new_message', aiMsg)
            // Do NOT broadcast a global "conversation_changed" for AI replies.
            // Admin UI should not receive AI-only conversations via the global list.
          }
        }
      } catch (aiErr) {
        logger.error('AI reply failed:', aiErr?.message || aiErr)
      }
    } catch (err) {
      console.error('Error saving message:', err.message)
    }
  })

  socket.on('typing', ({ conversationId, senderId }) => {
    socket.to(conversationId).emit('typing', { conversationId, senderId })
  })

  socket.on('disconnect', () => {
    logger.socket('Socket disconnected:', socket.id)
  })
})

connectDB()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server đang chạy ở cổng ${PORT}`)
    })
  })
  .catch((err) => {
    logger.error('Không thể khởi động server do lỗi kết nối DB:', err.message)
  })
