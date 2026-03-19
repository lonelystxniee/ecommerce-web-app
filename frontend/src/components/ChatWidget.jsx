import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import API_URL from "../config/apiConfig";

// create socket lazily to avoid connecting during SSR or tests
let socket;
function getSocket() {
    if (!socket) socket = io(API_URL, { transports: ["websocket", "polling"] });
    return socket;
}

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const user = typeof window !== "undefined" ? (() => {
        try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
    })() : null;

    const scrollRef = useRef(null);
    const lastUnreadIncRef = useRef(0);

    const conversationId = user ? `user:${user._id}` : null;

    // fetch conversations (to get unread count) and messages for this conversation
    const fetchConversations = async () => {
        if (!conversationId) return;
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations`);
            const data = await res.json();
            if (data.success) {
                const conv = (data.conversations || []).find((c) => c.conversationId === conversationId);
                setUnreadCount(conv ? conv.unreadCount || 0 : 0);
            }
        } catch (err) { console.error(err); }
    };

    const fetchMessages = async () => {
        if (!conversationId) return;
        try {
            const res = await fetch(`${API_URL}/api/chat/conversation/${conversationId}`);
            const data = await res.json();
            if (data.success) setMessages(data.messages || []);
        } catch (err) { console.error(err); }
    };

    const markConversationRead = async () => {
        if (!conversationId) return;
        try {
            await fetch(`${API_URL}/api/chat/conversation/${conversationId}/read`, { method: 'PUT' });
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (!conversationId) return;
        const s = getSocket();
        s.emit("join_conversation", { conversationId });

        fetchMessages();
        fetchConversations();

        const onNew = (msg) => {
            if (msg.conversationId !== conversationId) return;
            setMessages((prev) => {
                if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
                let filtered = prev;
                if (msg.clientId) filtered = filtered.filter((m) => String(m.clientId) !== String(msg.clientId));
                // Only increment unread for messages from others that are not admin/AI and not already marked read
                const isFromOther = String(msg.senderId) !== String(user?._id);
                const isAdminOrAI = msg.senderRole === 'admin' || msg.isAI === true;
                const isUnread = msg.read === false || msg.read === undefined;
                if (!open && isFromOther && !isAdminOrAI && isUnread) {
                    setUnreadCount((n) => n + 1);
                    lastUnreadIncRef.current = Date.now();
                }
                return [...filtered, msg];
            });
        };

        s.on("new_message", onNew);

        return () => {
            s.emit("leave_conversation", { conversationId });
            s.off("new_message", onNew);
        };
    }, [conversationId, open]);

    useEffect(() => {
        const s = getSocket();
        const onConvChanged = ({ conversationId: convId, senderId }) => {
            if (!convId || !conversationId) return;
            if (convId !== conversationId) return;
            if (open) return; // if chat is open, messages are visible / will be marked read
            if (String(senderId) === String(user?._id)) return; // ignore own sends
            if (Date.now() - lastUnreadIncRef.current < 800) return; // rate-limit
            // refresh unread count from server instead of incrementing locally
            fetchConversations();
            lastUnreadIncRef.current = Date.now();
        };
        if (s) s.on("conversation_changed", onConvChanged);
        return () => { if (s) s.off("conversation_changed", onConvChanged); };
    }, [conversationId, open, user]);

    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, open]);

    const handleSend = (overrideText) => {
        const content = (overrideText !== undefined ? overrideText : text).trim();
        if (!content || !user) return;
        const localId = `local-${Date.now()}`;
        const payload = { conversationId, senderId: user._id, receiverId: null, senderRole: "customer", content, clientId: localId };
        setMessages((m) => [...m, { ...payload, _id: localId, createdAt: new Date().toISOString(), clientId: localId }]);
        const s = getSocket();
        s.emit("send_message", payload);
        setText("");
    };





    if (!user) return null;

    const quickQuestions = ["Mình muốn hỏi trạng thái đơn hàng", "Shop có ship COD không?", "Cách trả hàng / hoàn tiền như thế nào?"];

    return (
        <div className="fixed right-6 bottom-6 z-50">
            {!open && (
                <button onClick={() => { setOpen(true); setUnreadCount(0); markConversationRead(); }} aria-label="Mở chat" className="relative w-16 h-16 rounded-full bg-[#800a0d] text-white shadow-2xl flex items-center justify-center">💬{unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>
            )}

            {open && (
                <div className="mt-3 w-96 max-w-full text-sm">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-4 py-3 bg-[#800a0d] text-white font-bold flex items-center justify-between">
                            <div>Hỗ trợ trực tuyến</div>
                            <button onClick={() => setOpen(false)} aria-label="Đóng chat" className="w-8 h-8 rounded-full bg-white text-[#800a0d] flex items-center justify-center font-bold">×</button>
                        </div>

                        <div ref={scrollRef} className="h-72 p-3 overflow-y-auto space-y-2 bg-gray-50">
                            {messages.map((m) => (
                                <div key={m._id} className={`flex ${m.senderRole === "admin" ? "justify-start" : "justify-end"}`}>
                                    <div className={`px-3 py-2 rounded-lg max-w-[75%] ${m.senderRole === "admin" ? "bg-white text-gray-800 border" : "bg-[#800a0d] text-white"}`}>
                                        <div className="text-xs">{m.content}</div>
                                        <div className="text-[11px] opacity-60 text-right mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 border-t border-gray-100">
                            <div className="flex gap-2 mb-3">
                                {quickQuestions.map((q) => (
                                    <button key={q} onClick={() => { handleSend(q); }} className="flex-1 bg-white border rounded-md px-3 py-2 text-xs text-[#5e4027]">{q}</button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="flex-1 px-3 py-2 rounded-md border border-gray-200 outline-none" placeholder="Gửi tin nhắn cho nhân viên hỗ trợ..." />
                                <button onClick={() => handleSend()} className="bg-[#800a0d] text-white px-4 py-2 rounded-md font-bold">Gửi</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

