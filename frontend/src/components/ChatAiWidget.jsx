import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import API_URL from "../config/apiConfig";

let socketAi;
function getSocketAi() {
    if (!socketAi) socketAi = io(API_URL, { transports: ["websocket", "polling"] });
    return socketAi;
}

export default function ChatAiWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const user = typeof window !== "undefined" ? (() => {
        try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
    })() : null;

    const scrollRef = useRef(null);

    const conversationId = user ? `ai:user:${user._id}` : null;

    useEffect(() => {
        if (!conversationId) return;
        const s = getSocketAi();
        s.emit("join_conversation", { conversationId });

        const fetchMessages = async () => {
            try {
                const res = await fetch(`${API_URL}/api/chat/conversation/${encodeURIComponent(conversationId)}`);
                const data = await res.json();
                if (data.success) setMessages(data.messages || []);
            } catch (err) { console.error(err); }
        };

        fetchMessages();

        const onNew = (msg) => {
            if (msg.conversationId !== conversationId) return;
            setMessages((prev) => {
                // ignore exact server duplicate
                if (prev.some((m) => String(m._id) === String(msg._id))) return prev;

                let filtered = prev;
                if (msg.clientId) {
                    // remove optimistic local message that has same clientId
                    filtered = filtered.filter((m) => String(m.clientId) !== String(msg.clientId));
                } else {
                    // fallback: remove optimistic local messages that match by content + sender
                    filtered = filtered.filter((m) => {
                        if (!m._id || !String(m._id).startsWith('local-')) return true;
                        return !(m.content === msg.content && String(m.senderId) === String(msg.senderId));
                    });
                }

                return [...filtered, msg];
            });
            // stop loading if AI replied
            if (msg.senderRole === 'ai' || msg.isAI) setLoading(false);
        };

        s.on("new_message", onNew);

        return () => {
            s.emit("leave_conversation", { conversationId });
            s.off("new_message", onNew);
        };
    }, [conversationId]);

    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, open]);

    const handleSend = (overrideText) => {
        const content = (overrideText !== undefined ? overrideText : text).trim();
        if (!content || !user || !conversationId) return;
        const localId = `local-${Date.now()}`;
        const payload = { conversationId, senderId: user._id, receiverId: null, senderRole: "customer", content, clientId: localId };
        setMessages((m) => [...m, { ...payload, _id: localId, createdAt: new Date().toISOString(), clientId: localId }]);
        const s = getSocketAi();
        s.emit("send_message", payload);
        setText("");
        setLoading(true);
        // safety clear
        setTimeout(() => setLoading(false), 25000);
    };

    if (!user) return null;

    return (
        <div className="fixed left-6 bottom-6 z-50">
            {!open && (
                <button onClick={() => setOpen(true)} aria-label="Mở trợ lý AI" className="relative w-16 h-16 rounded-full bg-green-600 text-white shadow-2xl flex items-center justify-center">🤖</button>
            )}

            {open && (
                <div className="mt-3 w-96 max-w-full text-sm">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-4 py-3 bg-green-600 text-white font-bold flex items-center justify-between">
                            <div>Trợ lý AI</div>
                            <button onClick={() => setOpen(false)} aria-label="Đóng AI" className="w-8 h-8 rounded-full bg-white text-green-600 flex items-center justify-center font-bold">×</button>
                        </div>

                        <div ref={scrollRef} className="h-92 p-3 overflow-y-auto space-y-2 bg-gray-50">
                            {messages.map((m) => (
                                <div key={m._id} className={`flex ${(m.senderRole === "ai" || m.isAI) ? "justify-start" : "justify-end"}`}>
                                    <div className={`px-3 py-2 rounded-lg max-w-[75%] ${(m.senderRole === "ai" || m.isAI) ? "bg-white text-gray-800 border" : "bg-green-600 text-white"}`}>
                                        <div className="text-xs break-words">{m.content}</div>
                                        <div className="text-[11px] opacity-60 text-right mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 border-t border-gray-100">
                            <div className="flex gap-2">
                                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="flex-1 px-3 py-2 rounded-md border border-gray-200 outline-none" placeholder="Hỏi trợ lý AI..." />
                                <button onClick={() => handleSend()} className="bg-green-600 text-white px-4 py-2 rounded-md font-bold">Gửi</button>
                            </div>
                            {loading && <div className="text-xs text-gray-500 mt-2">Đang xử lý AI…</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
