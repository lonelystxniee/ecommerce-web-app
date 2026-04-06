import { useEffect, useRef, useState } from 'react'
import { getSocket } from '../utils/socket'
import API_URL from '../config/apiConfig'

export default function CombinedChatWidget() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('support') // 'support' or 'ai'

  // Support States
  const [unreadCount, setUnreadCount] = useState(0)
  const [messagesSupport, setMessagesSupport] = useState([])
  const [textSupport, setTextSupport] = useState('')

  // AI States
  const [messagesAI, setMessagesAI] = useState([])
  const [textAI, setTextAI] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)

  const user =
    typeof window !== 'undefined'
      ? (() => {
          try {
            return JSON.parse(localStorage.getItem('user'))
          } catch {
            return null
          }
        })()
      : null

  const scrollRef = useRef(null)
  const lastUnreadIncRef = useRef(0)

  const conversationIdSupport = user ? `user:${user._id}` : null
  const conversationIdAI = user ? `ai:user:${user._id}` : null

  // Helper to format message with basic markdown-lite
  const formatMessage = (text) => {
    if (!text) return ''
    // Bold: **text** -> <b>text</b>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<b class="font-black text-inherit">$1</b>')

    // Links: [Text](URL) -> <a href="URL">Text</a>
    // Handling relative links for SPA navigation
    formatted = formatted.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" class="inline-block mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">$1</a>',
    )

    // Simple lists: * item -> <li class="ml-4">item</li>
    formatted = formatted
      .split('\n')
      .map((line) => {
        if (line.trim().startsWith('* ')) {
          return `<li class="ml-4 list-disc">${line.trim().substring(2)}</li>`
        }
        return line
      })
      .join('\n')
    // Newlines: \n -> <br/>
    return formatted.split('\n').join('<br/>')
  }

  // --- Support Logic ---
  const fetchSupportConversations = async () => {
    if (!conversationIdSupport) return
    try {
      const res = await fetch(`${API_URL}/api/chat/conversations`)
      const data = await res.json()
      if (data.success) {
        const conv = (data.conversations || []).find((c) => c.conversationId === conversationIdSupport)
        setUnreadCount(conv ? conv.unreadCount || 0 : 0)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchSupportMessages = async () => {
    if (!conversationIdSupport) return
    try {
      const res = await fetch(`${API_URL}/api/chat/conversation/${encodeURIComponent(conversationIdSupport)}`)
      const data = await res.json()
      if (data.success) setMessagesSupport(data.messages || [])
    } catch (err) {
      console.error(err)
    }
  }

  const markSupportAsRead = async () => {
    if (!conversationIdSupport) return
    try {
      await fetch(`${API_URL}/api/chat/conversation/${encodeURIComponent(conversationIdSupport)}/read`, { method: 'PUT' })
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }

  // --- AI Logic ---
  const fetchAIMessages = async () => {
    if (!conversationIdAI) return
    try {
      const res = await fetch(`${API_URL}/api/chat/conversation/${encodeURIComponent(conversationIdAI)}`)
      const data = await res.json()
      if (data.success) setMessagesAI(data.messages || [])
    } catch (err) {
      console.error(err)
    }
  }

  // --- Effects ---
  useEffect(() => {
    if (!user) return
    const s = getSocket()

    // Join both rooms
    if (conversationIdSupport) s.emit('join_conversation', { conversationId: conversationIdSupport })
    if (conversationIdAI) s.emit('join_conversation', { conversationId: conversationIdAI })

    fetchSupportMessages()
    fetchSupportConversations()
    fetchAIMessages()

    const onNewMessage = (msg) => {
      if (msg.conversationId === conversationIdSupport) {
        setMessagesSupport((prev) => {
          if (prev.some((m) => String(m._id) === String(msg._id))) return prev
          let filtered = prev
          if (msg.clientId) filtered = filtered.filter((m) => String(m.clientId) !== String(msg.clientId))
          const isFromOther = String(msg.senderId) !== String(user?._id)
          const isAdminOrAI = msg.senderRole === 'admin' || msg.isAI === true
          const isUnread = msg.read === false || msg.read === undefined
          if ((!open || activeTab !== 'support') && isFromOther && !isAdminOrAI && isUnread) {
            setUnreadCount((n) => n + 1)
            lastUnreadIncRef.current = Date.now()
          }
          return [...filtered, msg]
        })
      }
      if (msg.conversationId === conversationIdAI) {
        setMessagesAI((prev) => {
          if (prev.some((m) => String(m._id) === String(msg._id))) return prev
          let filtered = prev
          if (msg.clientId) {
            filtered = filtered.filter((m) => String(m.clientId) !== String(msg.clientId))
          } else {
            filtered = filtered.filter((m) => {
              if (!m._id || !String(m._id).startsWith('local-')) return true
              return !(m.content === msg.content && String(m.senderId) === String(msg.senderId))
            })
          }
          return [...filtered, msg]
        })
        if (msg.senderRole === 'ai' || msg.isAI) setLoadingAI(false)
      }
    }

    const onConvChanged = ({ conversationId: convId, senderId }) => {
      if (convId === conversationIdSupport) {
        if (open && activeTab === 'support') return
        if (String(senderId) === String(user?._id)) return
        if (Date.now() - lastUnreadIncRef.current < 800) return
        fetchSupportConversations()
        lastUnreadIncRef.current = Date.now()
      }
    }

    s.on('new_message', onNewMessage)
    s.on('conversation_changed', onConvChanged)

    return () => {
      if (conversationIdSupport) s.emit('leave_conversation', { conversationId: conversationIdSupport })
      if (conversationIdAI) s.emit('leave_conversation', { conversationId: conversationIdAI })
      s.off('new_message', onNewMessage)
      s.off('conversation_changed', onConvChanged)
    }
  }, [conversationIdSupport, conversationIdAI, open, activeTab])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messagesSupport, messagesAI, open, activeTab])

  useEffect(() => {
    if (open && activeTab === 'support') {
      markSupportAsRead()
    }
  }, [open, activeTab])

  const handleSendSupport = (overrideText) => {
    const content = (overrideText !== undefined ? overrideText : textSupport).trim()
    if (!content || !user || !conversationIdSupport) return
    const localId = `local-${Date.now()}`
    const payload = {
      conversationId: conversationIdSupport,
      senderId: user._id,
      receiverId: null,
      senderRole: 'customer',
      content,
      clientId: localId,
    }
    setMessagesSupport((m) => [
      ...m,
      {
        ...payload,
        _id: localId,
        createdAt: new Date().toISOString(),
        clientId: localId,
      },
    ])
    const s = getSocket()
    s.emit('send_message', payload)
    setTextSupport('')
  }

  const handleSendAI = (overrideText) => {
    const content = (overrideText !== undefined ? overrideText : textAI).trim()
    if (!content || !user || !conversationIdAI) return
    const localId = `local-${Date.now()}`
    const payload = {
      conversationId: conversationIdAI,
      senderId: user._id,
      receiverId: null,
      senderRole: 'customer',
      content,
      clientId: localId,
    }
    setMessagesAI((m) => [
      ...m,
      {
        ...payload,
        _id: localId,
        createdAt: new Date().toISOString(),
        clientId: localId,
      },
    ])
    const s = getSocket()
    s.emit('send_message', payload)
    setTextAI('')
    setLoadingAI(true)
    setTimeout(() => setLoadingAI(false), 45000)
  }

  if (!user) return null

  const quickQuestions = ['Mã giảm giá mới nhất?', 'Chính sách đổi trả', 'Thời gian giao hàng bao lâu?']

  return (
    <div className="fixed right-6 bottom-6 z-[9999] flex flex-col items-end print:hidden">
      {!open && (
        <button
          onClick={() => {
            setOpen(true)
          }}
          aria-label="Mở chat"
          className="group relative w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#9d0b0f] to-[#ca1d22] text-white shadow-2xl shadow-red-900/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto overflow-visible"
        >
          <div className="absolute inset-0 bg-white/20 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-3xl leading-none transition-transform duration-500 group-hover:rotate-12">💬</span>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#9d0b0f] text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="mt-3 w-[400px] max-w-[calc(100vw-3rem)] text-sm animate-zoomIn transform transition-all duration-300 origin-bottom-right drop-shadow-2xl">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col h-[650px] max-h-[85vh]">
            {/* Header Section */}
            <div className="relative px-8 pt-8 pb-6 bg-white">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-red-50/50 -z-10 blur-2xl"></div>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl transition-all duration-500 ${
                      activeTab === 'support'
                        ? 'bg-gradient-to-br from-[#9d0b0f] to-[#ca1d22] text-white shadow-red-200 rotate-3'
                        : 'bg-gradient-to-br from-teal-500 to-emerald-400 text-white shadow-teal-100 -rotate-3'
                    }`}
                  >
                    {activeTab === 'support' ? '👩‍💻' : '🤖'}
                  </div>
                  <div>
                    <h3 className="text-xl leading-tight text-gray-900 font-seagull">{activeTab === 'support' ? 'Hỗ trợ Momotrust' : 'Trợ lý AI Thông minh'}</h3>
                    <p className="text-xs font-bold flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full animate-pulse ${activeTab === 'support' ? 'bg-red-500' : 'bg-teal-500'}`}></span>
                      <span className={activeTab === 'support' ? 'text-red-500' : 'text-teal-600 uppercase tracking-tighter'}>{activeTab === 'support' ? 'Đang trực tuyến' : 'Sẵn sàng trả lời'}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-10 h-10 text-gray-400 transition-all duration-300 rounded-2xl hover:bg-red-50 hover:text-red-600 hover:rotate-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="flex p-1.5 bg-gray-100/80 rounded-[24px] border border-gray-100 relative">
                <button
                  onClick={() => setActiveTab('support')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] text-[13px] font-black transition-all duration-500 relative z-10 ${
                    activeTab === 'support' ? 'bg-white text-[#9d0b0f] shadow-lg scale-[1.02]' : 'text-gray-500 hover:text-gray-700 hover:scale-[0.98]'
                  }`}
                >
                  <span>HỖ TRỢ</span>
                  {unreadCount > 0 && <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full shadow-md">{unreadCount}</span>}
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] text-[13px] font-black transition-all duration-500 relative z-10 ${
                    activeTab === 'ai' ? 'bg-white text-teal-600 shadow-lg scale-[1.02]' : 'text-gray-500 hover:text-gray-700 hover:scale-[0.98]'
                  }`}
                >
                  <span>TRỢ LÝ AI</span>
                  <span className="bg-teal-100/50 text-teal-600 text-[8px] px-1.5 py-0.5 rounded-md font-black tracking-tighter">BETA</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 bg-gradient-to-b from-white to-[#fcfaf7] custom-scrollbar scroll-smooth">
              {activeTab === 'support' ? (
                <>
                  {messagesSupport.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-center opacity-70">
                      <div className="flex items-center justify-center w-24 h-24 mb-6 text-4xl rounded-full shadow-inner bg-red-50">👋</div>
                      <h4 className="mb-2 text-lg text-gray-800 font-seagull">Chào {user.fullName || 'bạn'}!</h4>
                      <p className="px-12 text-xs leading-relaxed text-gray-500">Chúng tôi luôn ở đây để lắng nghe và giải đáp mọi thắc mắc của bạn.</p>
                    </div>
                  )}
                  {messagesSupport.map((m) => (
                    <div key={m._id} className={`flex ${m.senderRole === 'admin' ? 'justify-start' : 'justify-end'} animate-zoomIn`}>
                      <div
                        className={`relative px-5 py-4 rounded-[1.8rem] max-w-[85%] transition-all duration-300 ${
                          m.senderRole === 'admin'
                            ? 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
                            : 'bg-gradient-to-br from-[#9d0b0f] to-[#ca1d22] text-white rounded-tr-sm shadow-xl shadow-red-900/10'
                        }`}
                      >
                        <div
                          className="text-[14px] leading-relaxed break-words whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: formatMessage(m.content),
                          }}
                        />
                        <div className={`text-[9px] mt-2 font-bold opacity-60 uppercase tracking-widest ${m.senderRole === 'admin' ? 'text-gray-400' : 'text-red-100 text-right'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {messagesAI.length === 0 && !loadingAI && (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-center opacity-70">
                      <div className="flex items-center justify-center w-24 h-24 mb-6 text-4xl rounded-full shadow-inner bg-teal-50">✨</div>
                      <h4 className="mb-2 text-lg text-gray-800 font-seagull">Trợ lý AI Momotrust</h4>
                      <p className="px-12 text-xs leading-relaxed text-gray-500">Nhập mã sản phẩm hoặc câu hỏi về chính sách để được tư vấn ngay lập tức!</p>
                    </div>
                  )}
                  {messagesAI.map((m) => (
                    <div key={m._id} className={`flex ${m.senderRole === 'ai' || m.isAI ? 'justify-start' : 'justify-end'} animate-zoomIn`}>
                      <div
                        className={`px-5 py-4 rounded-[1.8rem] max-w-[85%] transition-all duration-300 ${
                          m.senderRole === 'ai' || m.isAI
                            ? 'bg-white/80 backdrop-blur-md text-gray-800 border border-teal-100 rounded-tl-sm shadow-sm'
                            : 'bg-gradient-to-br from-teal-600 to-emerald-500 text-white rounded-tr-sm shadow-xl shadow-teal-900/10'
                        }`}
                      >
                        <div
                          className="text-[14px] leading-relaxed break-words whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: formatMessage(m.content),
                          }}
                        />
                        <div className={`text-[9px] mt-2 font-bold opacity-60 uppercase tracking-widest ${m.senderRole === 'ai' || m.isAI ? 'text-teal-400' : 'text-teal-50 text-right'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {loadingAI && (
                    <div className="flex justify-start">
                      <div className="px-6 py-4 rounded-[1.8rem] bg-white/80 border border-teal-100 rounded-tl-sm flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="relative p-8 border-t border-gray-100 bg-white/95 backdrop-blur-xl">
              {/* Decorative element for input focus */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-200 to-transparent opacity-0 transition-opacity focus-within:opacity-100"></div>

              {activeTab === 'support' && messagesSupport.length < 5 && (
                <div className="flex gap-2 px-2 pb-2 mb-6 -mx-2 overflow-x-auto scrollbar-hide">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendSupport(q)}
                      className="whitespace-nowrap px-5 py-2.5 rounded-full bg-red-50/50 text-[#9d0b0f] text-[11px] font-black border border-red-100 hover:bg-[#9d0b0f] hover:text-white transition-all duration-300 shadow-sm active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`flex items-center gap-3 p-2 rounded-[28px] border-2 transition-all duration-500 group shadow-sm bg-gray-50/50 ${
                  activeTab === 'support'
                    ? 'border-gray-50 focus-within:border-red-100/50 focus-within:bg-white focus-within:shadow-[0_10px_30px_rgba(157,11,15,0.08)]'
                    : 'border-gray-50 focus-within:border-teal-100/50 focus-within:bg-white focus-within:shadow-[0_10px_30px_rgba(20,184,166,0.08)]'
                }`}
              >
                <input
                  value={activeTab === 'support' ? textSupport : textAI}
                  onChange={(e) => (activeTab === 'support' ? setTextSupport(e.target.value) : setTextAI(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      activeTab === 'support' ? handleSendSupport() : handleSendAI()
                    }
                  }}
                  className="flex-1 px-5 py-3.5 bg-transparent text-[14px] outline-none placeholder-gray-400 font-medium text-gray-700"
                  placeholder={activeTab === 'support' ? 'Gửi lời nhắn chuyên gia...' : 'Hỏi trợ lý AI về sản phẩm...'}
                  disabled={activeTab === 'ai' && loadingAI}
                />
                <button
                  onClick={() => (activeTab === 'support' ? handleSendSupport() : handleSendAI())}
                  disabled={activeTab === 'support' ? !textSupport.trim() : !textAI.trim() || loadingAI}
                  className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 active:scale-90 ${
                    (activeTab === 'support' ? textSupport.trim() : textAI.trim() && !loadingAI)
                      ? activeTab === 'support'
                        ? 'bg-gradient-to-br from-[#9d0b0f] to-[#ca1d22] text-white shadow-xl shadow-red-900/30'
                        : 'bg-gradient-to-br from-teal-500 to-emerald-400 text-white shadow-xl shadow-teal-900/30'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed grayscale'
                  }`}
                >
                  {activeTab === 'ai' && loadingAI ? (
                    <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 transition-transform duration-300 transform rotate-45 group-hover:scale-110 active:rotate-12"
                    >
                      <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-6">
                <span className={`w-1 h-1 rounded-full ${activeTab === 'support' ? 'bg-red-400' : 'bg-teal-400'}`}></span>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-40">{activeTab === 'ai' ? 'MOMOTRUST INTELLIGENCE' : 'SẴN SÀNG HỖ TRỢ 24/7'}</p>
                <span className={`w-1 h-1 rounded-full ${activeTab === 'support' ? 'bg-red-400' : 'bg-teal-400'}`}></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
