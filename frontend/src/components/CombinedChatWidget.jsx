import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "../utils/socket";
import API_URL from "../config/apiConfig";

export default function CombinedChatWidget() {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("support"); // 'support' or 'ai'
    
    // Support States
    const [unreadCount, setUnreadCount] = useState(0);
    const [messagesSupport, setMessagesSupport] = useState([]);
    const [textSupport, setTextSupport] = useState("");
    
    // AI States
    const [messagesAI, setMessagesAI] = useState([]);
    const [textAI, setTextAI] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);

    const user = typeof window !== "undefined" ? (() => {
        try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
    })() : null;

    const scrollRef = useRef(null);
    const lastUnreadIncRef = useRef(0);

    const conversationIdSupport = user ? `user:${user._id}` : null;
    const conversationIdAI = user ? `ai:user:${user._id}` : null;

    // --- Support Logic ---
    const fetchSupportConversations = async () => {
        if (!conversationIdSupport) return;
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations`);
            const data = await res.json();
            if (data.success) {
                const conv = (data.conversations || []).find((c) => c.conversationId === conversationIdSupport);
                setUnreadCount(conv ? conv.unreadCount || 0 : 0);
            }
        } catch (err) { console.error(err); }
    };

    const fetchSupportMessages = async () => {
        if (!conversationIdSupport) return;
        try {
            const res = await fetch(`${API_URL}/api/chat/conversation/${encodeURIComponent(conversationIdSupport)}`);
            const data = await res.json();
            if (data.success) setMessagesSupport(data.messages || []);
        } catch (err) { console.error(err); }
    };

    const markSupportAsRead = async () => {
        if (!conversationIdSupport) return;
        try {
            await fetch(`${API_URL}/api/chat/conversation/${encodeURIComponent(conversationIdSupport)}/read`, { method: 'PUT' });
            setUnreadCount(0);
        } catch (err) { console.error(err); }
    };

    // --- AI Logic ---
    const fetchAIMessages = async () => {
        if (!conversationIdAI) return;
        try {
            const res = await fetch(`${API_URL}/api/chat/conversation/${encodeURIComponent(conversationIdAI)}`);
            const data = await res.json();
            if (data.success) setMessagesAI(data.messages || []);
        } catch (err) { console.error(err); }
    };

    // --- Effects ---
    useEffect(() => {
        if (!user) return;
        const s = getSocket();
        
        // Join both rooms
        if (conversationIdSupport) s.emit("join_conversation", { conversationId: conversationIdSupport });
        if (conversationIdAI) s.emit("join_conversation", { conversationId: conversationIdAI });

        fetchSupportMessages();
        fetchSupportConversations();
        fetchAIMessages();

        const onNewMessage = (msg) => {
            // Support message
            if (msg.conversationId === conversationIdSupport) {
                setMessagesSupport((prev) => {
                    if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
                    let filtered = prev;
                    if (msg.clientId) filtered = filtered.filter((m) => String(m.clientId) !== String(msg.clientId));
                    
                    const isFromOther = String(msg.senderId) !== String(user?._id);
                    const isAdminOrAI = msg.senderRole === 'admin' || msg.isAI === true;
                    const isUnread = msg.read === false || msg.read === undefined;
                    
                    if ((!open || activeTab !== 'support') && isFromOther && !isAdminOrAI && isUnread) {
                        setUnreadCount((n) => n + 1);
                        lastUnreadIncRef.current = Date.now();
                    }
                    return [...filtered, msg];
                });
            }
            
            // AI message
            if (msg.conversationId === conversationIdAI) {
                setMessagesAI((prev) => {
                    if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
                    let filtered = prev;
                    if (msg.clientId) {
                        filtered = filtered.filter((m) => String(m.clientId) !== String(msg.clientId));
                    } else {
                        filtered = filtered.filter((m) => {
                            if (!m._id || !String(m._id).startsWith('local-')) return true;
                            return !(m.content === msg.content && String(m.senderId) === String(msg.senderId));
                        });
                    }
                    return [...filtered, msg];
                });
                if (msg.senderRole === 'ai' || msg.isAI) setLoadingAI(false);
            }
        };

        const onConvChanged = ({ conversationId: convId, senderId }) => {
            if (convId === conversationIdSupport) {
                if (open && activeTab === 'support') return;
                if (String(senderId) === String(user?._id)) return;
                if (Date.now() - lastUnreadIncRef.current < 800) return;
                fetchSupportConversations();
                lastUnreadIncRef.current = Date.now();
            }
        };

        s.on("new_message", onNewMessage);
        s.on("conversation_changed", onConvChanged);

        return () => {
            if (conversationIdSupport) s.emit("leave_conversation", { conversationId: conversationIdSupport });
            if (conversationIdAI) s.emit("leave_conversation", { conversationId: conversationIdAI });
            s.off("new_message", onNewMessage);
            s.off("conversation_changed", onConvChanged);
        };
    }, [conversationIdSupport, conversationIdAI, open, activeTab]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messagesSupport, messagesAI, open, activeTab]);

    useEffect(() => {
        if (open && activeTab === 'support') {
            markSupportAsRead();
        }
    }, [open, activeTab]);

    const handleSendSupport = (overrideText) => {
        const content = (overrideText !== undefined ? overrideText : textSupport).trim();
        if (!content || !user || !conversationIdSupport) return;
        const localId = `local-${Date.now()}`;
        const payload = { conversationId: conversationIdSupport, senderId: user._id, receiverId: null, senderRole: "customer", content, clientId: localId };
        setMessagesSupport((m) => [...m, { ...payload, _id: localId, createdAt: new Date().toISOString(), clientId: localId }]);
        const s = getSocket();
        s.emit("send_message", payload);
        setTextSupport("");
    };

    const handleSendAI = (overrideText) => {
        const content = (overrideText !== undefined ? overrideText : textAI).trim();
        if (!content || !user || !conversationIdAI) return;
        const localId = `local-${Date.now()}`;
        const payload = { conversationId: conversationIdAI, senderId: user._id, receiverId: null, senderRole: "customer", content, clientId: localId };
        setMessagesAI((m) => [...m, { ...payload, _id: localId, createdAt: new Date().toISOString(), clientId: localId }]);
        const s = getSocket();
        s.emit("send_message", payload);
        setTextAI("");
        setLoadingAI(true);
        setTimeout(() => setLoadingAI(false), 25000);
    };

    if (!user) return null;

    const quickQuestions = ["Mã giảm giá mới nhất?", "Chính sách đổi trả", "Thời gian giao hàng bao lâu?"];

    return (
        <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end print:hidden">
            {!open && (
                <button 
                    onClick={() => { setOpen(true); }} 
                    aria-label="Mở chat" 
                    className="group relative w-16 h-16 rounded-3xl bg-white text-[#800a0d] shadow-2xl shadow-red-900/20 flex items-center justify-center hover:scale-105 transition-all duration-300 border border-red-100"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-white rounded-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-3xl leading-none transform group-hover:rotate-12 transition-transform">💬</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#800a0d] text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            )}

            {open && (
                <div className="mt-3 w-[400px] max-w-[calc(100vw-3rem)] text-sm animate-fade-in-up transform transition-all duration-300 origin-bottom-right">
                    <div className="bg-white/95 backdrop-blur-2xl border border-red-50 rounded-[2rem] shadow-2xl shadow-red-900/10 overflow-hidden flex flex-col h-[600px] max-h-[85vh]">
                        
                        {/* Header Section */}
                        <div className="pt-6 px-6 pb-4 bg-white border-b border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-700 to-rose-600 flex items-center justify-center text-xl shadow-lg shadow-red-900/20 text-white">
                                        {activeTab === 'support' ? '👩‍💻' : '🤖'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                            {activeTab === 'support' ? 'Hỗ trợ trực tuyến' : 'Trợ lý AI Thông minh'}
                                        </h3>
                                        <p className="text-xs text-green-500 font-medium flex items-center gap-1.5 mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            Đang trực tuyến
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setOpen(false)} 
                                    className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Custom Tabs */}
                            <div className="flex p-1 bg-gray-50 rounded-2xl">
                                <button 
                                    onClick={() => setActiveTab('support')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                                        activeTab === 'support' 
                                        ? "bg-white text-[#800a0d] shadow-sm scale-[1.02]" 
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                    }`}
                                >
                                    <span>Trực tuyến</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-[#800a0d] text-white text-[9px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                                    )}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('ai')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                                        activeTab === 'ai' 
                                        ? "bg-white text-teal-600 shadow-sm scale-[1.02]" 
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                    }`}
                                >
                                    <span>Trợ lý AI</span>
                                    <span className="bg-teal-100 text-teal-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">Beta</span>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-white/50 scroll-smooth">
                            {activeTab === 'support' ? (
                                <>
                                    {messagesSupport.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-3xl mb-4 animate-bounce-slow">👋</div>
                                            <h4 className="font-bold text-gray-900 mb-1">Chào {user.name || 'bạn'}!</h4>
                                            <p className="text-gray-500 text-xs px-10">Đội ngũ hỗ trợ đã sẵn sàng giúp đỡ bạn. Hãy đặt câu hỏi bất cứ lúc nào!</p>
                                        </div>
                                    )}
                                    {messagesSupport.map((m) => (
                                        <div key={m._id} className={`flex ${m.senderRole === "admin" ? "justify-start" : "justify-end"} group animate-fade-in`}>
                                            <div className={`relative px-4 py-3 rounded-2xl max-w-[85%] transition-all ${
                                                m.senderRole === "admin" 
                                                ? "bg-gray-100 text-gray-800 rounded-tl-sm shadow-sm" 
                                                : "bg-[#800a0d] text-white rounded-tr-sm shadow-md"
                                            }`}>
                                                <div className="text-[13px] leading-relaxed break-words">{m.content}</div>
                                                <div className={`text-[9px] mt-1.5 font-medium ${m.senderRole === "admin" ? "text-gray-400" : "text-red-100/70 text-right"}`}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {messagesAI.length === 0 && !loadingAI && (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                            <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-3xl mb-4 animate-pulse">✨</div>
                                            <h4 className="font-bold text-gray-900 mb-1">Trợ lý AI Thông minh</h4>
                                            <p className="text-gray-500 text-xs px-10">Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn size hoặc giải đáp các thắc mắc chung.</p>
                                        </div>
                                    )}
                                    {messagesAI.map((m) => (
                                        <div key={m._id} className={`flex ${(m.senderRole === "ai" || m.isAI) ? "justify-start" : "justify-end"} animate-fade-in`}>
                                            <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                                                (m.senderRole === "ai" || m.isAI) 
                                                ? "bg-teal-50 text-gray-800 border border-teal-100 rounded-tl-sm" 
                                                : "bg-teal-600 text-white rounded-tr-sm shadow-md"
                                            }`}>
                                                <div className="text-[13px] leading-relaxed break-words">{m.content}</div>
                                                <div className={`text-[9px] mt-1.5 font-medium ${(m.senderRole === "ai" || m.isAI) ? "text-teal-400" : "text-teal-100/70 text-right"}`}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {loadingAI && (
                                        <div className="flex justify-start">
                                            <div className="px-5 py-3 rounded-2xl bg-teal-50 border border-teal-100 rounded-tl-sm flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-gray-100">
                            {activeTab === 'support' && messagesSupport.length < 5 && (
                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                                    {quickQuestions.map((q) => (
                                        <button 
                                            key={q} 
                                            onClick={() => handleSendSupport(q)} 
                                            className="whitespace-nowrap px-4 py-1.5 rounded-full bg-rose-50 text-[#800a0d] text-[11px] font-bold border border-rose-100 hover:bg-rose-100 transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all duration-300 ${
                                activeTab === 'support' 
                                ? "bg-gray-50 border-gray-200 focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-50" 
                                : "bg-teal-50/30 border-teal-100 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-50"
                            }`}>
                                <input 
                                    value={activeTab === 'support' ? textSupport : textAI} 
                                    onChange={(e) => activeTab === 'support' ? setTextSupport(e.target.value) : setTextAI(e.target.value)} 
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            activeTab === 'support' ? handleSendSupport() : handleSendAI();
                                        }
                                    }} 
                                    className="flex-1 px-4 py-2.5 bg-transparent text-[13px] outline-none placeholder-gray-400 text-gray-700" 
                                    placeholder={activeTab === 'support' ? "Gửi lời nhắn..." : "Hỏi trợ lý AI..."} 
                                    disabled={activeTab === 'ai' && loadingAI}
                                />
                                <button 
                                    onClick={() => activeTab === 'support' ? handleSendSupport() : handleSendAI()} 
                                    disabled={(activeTab === 'support' ? !textSupport.trim() : (!textAI.trim() || loadingAI))}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                        (activeTab === 'support' ? textSupport.trim() : (textAI.trim() && !loadingAI))
                                        ? (activeTab === 'support' ? "bg-[#800a0d] text-white shadow-lg shadow-red-900/20" : "bg-teal-600 text-white shadow-lg shadow-teal-900/20")
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    {(activeTab === 'ai' && loadingAI) ? (
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-gray-400 mt-4 font-medium uppercase tracking-widest">
                                {activeTab === 'ai' ? 'Powered by Advanced AI' : 'Hỗ trợ bởi đội ngũ Momotrust'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
