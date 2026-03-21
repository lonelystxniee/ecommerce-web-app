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
            <div className="fixed right-6 bottom-6 z-50">
                {!open && (
                    <button onClick={() => { setOpen(true); setTotalUnread(0); }} className="relative w-16 h-16 rounded-full bg-[#800a0d] text-white shadow-2xl flex items-center justify-center">💬
                        {totalUnread > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{totalUnread > 9 ? '9+' : totalUnread}</span>}
                    </button>
                )}


                {open && (
                    <div className="mt-3 w-[720px] max-w-full text-sm">
                        <div className="bg-white border border-gray-100 rounded-lg shadow-2xl overflow-hidden flex">
                            {/* Left: conversations list */}
                            <div className="w-72 border-r">
                                <div className="px-4 py-3 bg-[#faf9f7] font-bold">Cuộc hội thoại</div>
                                <div className="p-3 h-[420px] overflow-y-auto">
                                    {conversations.length === 0 && <div className="text-xs text-gray-500">Chưa có cuộc hội thoại</div>}
                                    {conversations.map((c) => (
                                        <div key={c.conversationId} onClick={() => openConversation(c)} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${conversationId === c.conversationId ? 'bg-gray-100' : ''}`}>
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {c.user && c.user.avatar ? <img src={c.user.avatar} alt="av" className="w-full h-full object-cover" /> : <div className="text-xs">U</div>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <div className="font-bold text-sm">{c.user?.fullName || c.conversationId}</div>
                                                    <div className="text-[11px] opacity-60">{new Date(c.lastAt).toLocaleString()}</div>
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1">{c.lastMessage}</div>
                                            </div>
                                            {c.unreadCount > 0 && <div className="ml-2 bg-[#800a0d] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">{c.unreadCount}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: messages */}
                            <div className="flex-1">
                                <div className="px-4 py-3 bg-[#800a0d] text-white font-bold flex items-center justify-between">
                                    <div>Chat Admin</div>
                                    <button onClick={handleClose} aria-label="Đóng chat" className="w-8 h-8 rounded-full bg-white text-[#800a0d] flex items-center justify-center font-bold">×</button>
                                </div>

                                <div className="p-4 h-[420px] overflow-y-auto bg-gray-50" ref={scrollRef}>
                                    {messages.length === 0 && <div className="text-xs text-gray-500">Chưa chọn cuộc hội thoại hoặc chưa có tin nhắn</div>}
                                    {messages.map((m) => (
                                        <div key={m._id} className={`mb-3 flex ${m.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`px-3 py-2 rounded-lg max-w-[70%] ${m.senderRole === 'admin' ? 'bg-[#800a0d] text-white' : 'bg-white border text-gray-800'}`}>
                                                <div className="text-sm">{m.content}</div>
                                                <div className="text-[11px] opacity-60 text-right mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-3 border-t bg-white">
                                    <div className="mb-3">
                                        <div className="flex gap-2">
                                            {cannedReplies.map((r) => (
                                                <button key={r} onClick={() => handleSend(r)} className="flex-1 bg-white border rounded-md px-3 py-2 text-xs text-[#5e4027]">
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Nhập tin nhắn..." className="flex-1 px-3 py-2 rounded-lg border" />
                                        <button onClick={() => handleSend()} className="bg-[#800a0d] text-white px-4 py-2 rounded-lg">Gửi</button>
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
