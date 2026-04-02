import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// create socket lazily to avoid connecting during SSR or at module load
let socket;
function getSocket() {
    if (!socket) socket = io(import.meta.env.VITE_API_URL || "http://localhost:5175", { transports: ["websocket", "polling"] });
    return socket;
}

export default function ChatPanel() {
    const [open, setOpen] = useState(false);
    const [targetUserId, setTargetUserId] = useState("");
    const [conversationId, setConversationId] = useState("");
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [conversations, setConversations] = useState([]);
    const [totalUnread, setTotalUnread] = useState(0);
    const scrollRef = useRef(null);
    const admin = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;

    const resetChatState = () => {
        setTargetUserId("");
        setConversationId("");
        setMessages([]);
        setText("");
    };

    const handleClose = () => {
        setOpen(false);
        setTotalUnread(0);
        resetChatState();
    };

    useEffect(() => {
        if (!conversationId) return;

        const s = getSocket();
        // ensure join happens after socket is created/connected
        s.emit("join_conversation", { conversationId });

        const fetchMessages = async () => {
            try {
                // exclude AI-generated messages for admin view (encode conversationId safely)
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversation/${encodeURIComponent(conversationId)}?excludeAI=true`);
                const data = await res.json();
                if (data.success) setMessages(data.messages || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMessages();

        return () => {
            socket.emit("leave_conversation", { conversationId });
        };
    }, [conversationId]);

    // fetch conversation list
    const fetchConversations = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversations`);
            const data = await res.json();
            if (data.success) {
                // ensure unique conversations by conversationId
                const uniq = [];
                const seen = new Set();
                (data.conversations || []).forEach((c) => {
                    if (!seen.has(c.conversationId)) {
                        seen.add(c.conversationId);
                        uniq.push(c);
                    }
                });
                // remove any AI assistant conversations from admin list (safety client-side)
                const filtered = uniq.filter((c) => !(typeof c.conversationId === 'string' && c.conversationId.startsWith('ai:')));
                setConversations(filtered);
                // compute total unread for badge
                const total = (filtered || []).reduce((s, c) => s + (c.unreadCount || 0), 0);
                setTotalUnread(total);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        // initial load
        fetchConversations();

        // listen for any incoming message globally to refresh list
        const s = getSocket();
        const onNew = (msg) => {
            // ignore AI-generated messages in admin realtime view
            if (msg && msg.isAI) return;
            // refresh list
            fetchConversations();
            if (msg.conversationId !== conversationId) return;

            setMessages((prev) => {
                // if server _id already present, ignore
                if (prev.some((m) => String(m._id) === String(msg._id))) return prev;

                // remove any optimistic local messages that match by clientId
                let filtered = prev;
                if (msg.clientId) {
                    filtered = filtered.filter((m) => String(m.clientId) !== String(msg.clientId));
                } else {
                    // fallback: remove local optimistic messages with same content + sender
                    filtered = filtered.filter((m) => {
                        if (!m._id || !String(m._id).startsWith("local-")) return true;
                        return !(m.content === msg.content && String(m.senderId) === String(msg.senderId));
                    });
                }

                return [...filtered, msg];
            });
        };
        s.on("new_message", onNew);

        return () => s.off("new_message", onNew);
    }, [conversationId]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const openConversation = (conv) => {
        if (!conv || !conv.conversationId) return;
        setConversationId(conv.conversationId);
        setOpen(true);

        // mark read (encode conversation id)
        fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversation/${encodeURIComponent(conv.conversationId)}/read`, { method: 'PUT' })
            .then(() => fetchConversations())
            .catch(() => { });
    };

    const handleSend = (overrideText) => {
        const content = (overrideText !== undefined ? overrideText : text).trim();
        if (!content || !admin || !conversationId) return;
        const localId = `local-${Date.now()}`;
        const payload = {
            conversationId,
            senderId: admin._id,
            receiverId: null,
            senderRole: "admin",
            content,
            clientId: localId,
        };
        // optimistic UI with clientId for later reconciliation
        setMessages((m) => [...m, { ...payload, _id: localId, createdAt: new Date().toISOString(), clientId: localId }]);
        socket.emit("send_message", payload);
        setText("");
    };

    const cannedReplies = [
        "Xin chào, mình có thể giúp gì cho bạn?",
        "Vui lòng cho biết mã đơn hàng hoặc thông tin chi tiết.",
        "Yêu cầu của bạn đã được ghi nhận — chúng tôi sẽ xử lý sớm.",
    ];

    return (
        <div>
            <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
                {!open && (
                    <button 
                        onClick={() => { setOpen(true); setTotalUnread(0); }} 
                        aria-label="Mở chat quản trị" 
                        className="relative w-16 h-16 rounded-full bg-gradient-to-r from-red-700 to-rose-600 text-white shadow-xl shadow-red-900/30 flex items-center justify-center hover:scale-105 transition-transform duration-300 animate-pulse-slow"
                    >
                        <span className="text-2xl drop-shadow-md">💬</span>
                        {totalUnread > 0 && (
                            <span className="absolute -top-1 -right-1 bg-white text-red-600 border-2 border-red-600 text-[10px] font-bold min-w-6 h-6 px-1 rounded-full flex items-center justify-center shadow-md animate-bounce">
                                {totalUnread > 9 ? '9+' : totalUnread}
                            </span>
                        )}
                    </button>
                )}


                {open && (
                    <div className="mt-3 w-[850px] max-w-[calc(100vw-3rem)] text-sm animate-fade-in-up transform transition-all duration-300 origin-bottom-right">
                        <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[28px] shadow-[0_20px_60px_-15px_rgba(128,10,13,0.3)] overflow-hidden flex h-[600px] max-h-[85vh]">
                            {/* Left: conversations list */}
                            <div className="w-80 shrink-0 border-r border-gray-100 flex flex-col bg-white">
                                <div className="px-6 py-5 bg-[#faf9f7] font-black text-[#800a0d] text-xs uppercase tracking-widest border-b border-gray-100 flex items-center justify-between shrink-0">
                                    <span>Cuộc hội thoại</span>
                                    {totalUnread > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">{totalUnread} mới</span>}
                                </div>
                                <div className="p-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                    {conversations.length === 0 && <div className="text-xs text-center p-10 text-gray-400 font-medium italic">Chưa có cuộc hội thoại</div>}
                                    {conversations.map((c) => (
                                        <div 
                                            key={c.conversationId} 
                                            onClick={() => openConversation(c)} 
                                            className={`flex items-center gap-3 p-3 mb-1.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
                                                conversationId === c.conversationId 
                                                ? 'bg-red-50/80 border-red-100 shadow-sm' 
                                                : 'hover:bg-gray-50 hover:border-gray-100'
                                            }`}
                                        >
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                                    {c.user && c.user.avatar ? <img src={c.user.avatar} alt="av" className="w-full h-full object-cover" /> : <span className="font-black text-gray-400">U</span>}
                                                </div>
                                                {conversationId === c.conversationId && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <div className={`font-bold text-sm truncate ${conversationId === c.conversationId ? 'text-[#800a0d]' : 'text-gray-800'}`}>
                                                        {c.user?.fullName || c.conversationId}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-400 shrink-0 ml-2">
                                                        {new Date(c.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center gap-2">
                                                    <div className={`text-xs truncate ${c.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                                                        {c.lastMessage}
                                                    </div>
                                                    {c.unreadCount > 0 && (
                                                        <div className="shrink-0 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-full px-2 min-w-[1.25rem] h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                            {c.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: messages */}
                            <div className="flex-1 flex flex-col bg-[#fdfaf5] min-w-0">
                                <div className="px-6 py-4 bg-gradient-to-r from-red-800 to-rose-600 text-white flex items-center justify-between shadow-sm relative overflow-hidden shrink-0">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 text-2xl shadow-inner">👩‍💻</div>
                                        <div>
                                            <div className="font-black text-base tracking-wide flex items-center gap-2">Hỗ trợ khách hàng</div>
                                            <div className="text-[11px] text-red-100 flex items-center gap-1.5 mt-0.5 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-green-400 border border-white/50 animate-pulse"></span> Sẵn sàng tư vấn
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleClose} aria-label="Đóng chat" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xl transition-colors z-10 shadow-sm">×</button>
                                </div>

                                <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4 scrollbar-thin scrollbar-thumb-gray-200" ref={scrollRef}>
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                                            <div className="text-5xl mb-4 animate-bounce-slow">💬</div>
                                            <p className="text-gray-500 font-bold">Chưa có tin nhắn</p>
                                            <p className="text-gray-400 text-xs mt-1">Bắt đầu trò chuyện với khách hàng ngay</p>
                                        </div>
                                    )}
                                    {messages.map((m) => (
                                        <div key={m._id} className={`flex ${m.senderRole === 'admin' ? 'justify-end' : 'justify-start'} animate-fade-in mb-2`}>
                                            <div className={`px-5 py-3 rounded-2xl max-w-[80%] shadow-sm ${
                                                m.senderRole === 'admin' 
                                                ? 'bg-gradient-to-br from-red-600 to-rose-500 text-white' 
                                                : 'bg-white text-gray-800 border border-gray-100'
                                            }`}>
                                                <div className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">{m.content}</div>
                                                <div className={`text-[10px] mt-1.5 text-right font-medium ${m.senderRole === 'admin' ? 'text-red-100/90' : 'text-gray-400'}`}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
                                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide snap-x whitespace-nowrap [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-red-300">
                                        {cannedReplies.map((r) => (
                                            <button key={r} onClick={() => handleSend(r)} className="shrink-0 snap-start bg-[#fffbf5] border border-orange-100 hover:bg-orange-50 hover:border-orange-200 transition-colors rounded-full px-4 py-1.5 text-xs font-bold text-[#800a0d] shadow-sm">
                                                {r}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 items-center bg-gray-50 p-1.5 rounded-[18px] border border-gray-200 focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-100/50 transition-all">
                                        <input 
                                            value={text} 
                                            onChange={(e) => setText(e.target.value)} 
                                            onKeyDown={(e) => e.key === "Enter" && handleSend()} 
                                            placeholder="Nhập câu trả lời cho khách hàng..." 
                                            className="flex-1 px-4 py-2 bg-transparent text-[15px] outline-none placeholder-gray-400 font-medium text-gray-800" 
                                        />
                                        <button 
                                            onClick={() => handleSend()} 
                                            disabled={!text.trim()} 
                                            className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                                text.trim() 
                                                ? 'bg-gradient-to-r from-red-700 to-red-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -rotate-45 ml-1 mt-0.5">
                                              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI functionality removed */}
            </div>
        </div>
    );
}
