import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    ChevronLeft,
    Trophy,
    RefreshCw,
    Copy,
    Ticket,
    Loader2,
    CheckCircle,
    Gift,
    Navigation,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

const LuckyWheel = () => {
    const [dbPromos, setDbPromos] = useState([]);
    const [myVouchers, setMyVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await fetch(`${API_URL}/api/promotions/all`);
                const data = await res.json();
                if (data.success) {
                    setDbPromos(data.promos.filter((p) => p.status === "ACTIVE"));
                }
            } catch (error) {
                console.error("Lỗi lấy khuyến mãi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromos();
    }, []);

    const wheelPrizes = useMemo(() => {
        const colors = ["#9d0b0f", "#3e2714", "#f39200", "#88694f"];
        let segments = [];

        const formattedPromos = dbPromos.map((p) => ({
            name:
                p.discountType === "AMOUNT"
                    ? `Giảm ${p.discountValue / 1000}K`
                    : `Giảm ${p.discountValue}%`,
            code: p.code,
            description: p.description || `Mã giảm giá ${p.code}`,
        }));

        for (let i = 0; i < 8; i++) {
            if (formattedPromos[i]) {
                segments.push({
                    ...formattedPromos[i],
                    color: colors[i % colors.length],
                });
            } else {
                segments.push({
                    name: i % 2 === 0 ? "Thêm lượt" : "Mất lượt",
                    code: null,
                    color: colors[i % colors.length],
                });
            }
        }
        return segments;
    }, [dbPromos]);

    const spinWheel = () => {
        if (isSpinning || wheelPrizes.length === 0) return;

        setIsSpinning(true);
        setResult(null);

        const extraDegree = Math.floor(Math.random() * 360);
        const newRotation = rotation + 1800 + extraDegree;
        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
            const actualDegree = newRotation % 360;
            const segmentAngle = 360 / 8;

            const prizeIndex = Math.floor((360 - actualDegree) / segmentAngle) % 8;
            const winner = wheelPrizes[prizeIndex];

            setResult(winner);
            if (winner.code) {
                setMyVouchers((prev) => {
                    if (prev.find((v) => v.code === winner.code)) return prev;
                    return [winner, ...prev];
                });
                setShowPopup(true);
            } else {
                toast(winner.name + "! Chúc bạn may mắn lần sau.", { icon: "🎰" });
            }
        }, 3500);
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success("Đã sao chép mã: " + code);
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f4ef]">
                <Loader2 className="animate-spin text-[#9d0b0f]" size={40} />
            </div>
        );

    return (
        <div
            className="min-h-screen bg-[#f7f4ef] font-sans pb-20 overflow-hidden relative"
            style={{
                backgroundImage: `url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')`,
            }}
        >
            <div className="max-w-[1200px] mx-auto px-4 pt-10">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-[#9d0b0f] font-bold hover:underline mb-8"
                >
                    <ChevronLeft size={20} /> Quay lại trang chủ
                </Link>

                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-6xl font-black text-[#9d0b0f] uppercase tracking-tighter mb-2">
                        Vòng Quay Tinh Hoa
                    </h2>
                    <p className="text-[#88694f] font-medium italic">
                        Săn Voucher thật từ hệ thống ClickGo
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
                    <div className="relative w-[320px] h-[320px] md:w-[480px] md:h-[480px]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-40 text-[#f39200]">
                            <div
                                className="w-10 h-12 bg-current"
                                style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
                            ></div>
                        </div>

                        <div
                            className="w-full h-full rounded-full border-[15px] border-[#3e2714] shadow-[0_0_60px_rgba(157,11,15,0.4)] relative overflow-hidden transition-transform duration-[3500ms] ease-out bg-[#3e2714]"
                            style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            {wheelPrizes.map((prize, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 left-0 w-full h-full origin-center"
                                    style={{
                                        transform: `rotate(${i * (360 / wheelPrizes.length)}deg)`,
                                        clipPath: "polygon(50% 50%, 29.3% 0%, 70.7% 0%)",
                                        backgroundColor: prize.color,
                                    }}
                                >
                                    <div className="absolute top-8 md:top-12 left-0 w-full flex justify-center items-start">
                                        <span
                                            className="text-[10px] md:text-[14px] font-black text-white uppercase whitespace-nowrap drop-shadow-md"
                                            style={{
                                                writingMode: "vertical-rl",
                                                transform: "rotate(180deg)",
                                                maxHeight: "35%",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {prize.name}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full z-10 border-8 border-[#3e2714] shadow-inner"></div>
                        </div>

                        <button
                            onClick={spinWheel}
                            disabled={isSpinning}
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-28 h-28 rounded-full font-black text-white uppercase tracking-widest text-lg shadow-2xl transition-all active:scale-90 border-4 border-[#faa519]
                ${isSpinning ? "bg-gray-400" : "bg-[#9d0b0f] hover:bg-red-800"}`}
                        >
                            {isSpinning ? "..." : "QUAY"}
                        </button>
                    </div>

                    <div className="w-full max-w-md space-y-6">
                        <div className="bg-white p-8 rounded-[40px] shadow-xl border-2 border-[#faa519]/20">
                            <h3 className="text-xl font-black text-[#9d0b0f] uppercase mb-4 flex items-center gap-2">
                                <RefreshCw size={20} /> Thể lệ & Hướng dẫn
                            </h3>
                            <div className="space-y-2 text-xs text-[#88694f] font-medium leading-relaxed">
                                <p>• Dữ liệu mã được cập nhật từ kho khuyến mãi hệ thống.</p>
                                <p>
                                    • Mã trúng thưởng sẽ xuất hiện ngay trong danh sách bên dưới.
                                </p>
                                <p>• Bấm sao chép và dán vào ô khuyến mãi khi thanh toán.</p>
                            </div>
                        </div>

                        <div className="bg-[#3e2714] p-6 rounded-[32px] text-white shadow-lg border border-white/5 min-h-[320px]">
                            <p className="text-[10px] font-bold text-[#f39200] uppercase mb-5 tracking-widest flex items-center gap-2">
                                <Ticket size={14} /> Voucher bạn đã săn được
                            </p>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {myVouchers.length === 0 ? (
                                    <div className="py-10 text-center opacity-30 flex flex-col items-center">
                                        <Gift size={40} className="mb-2" />
                                        <p className="text-xs italic">Chưa có phần quà nào...</p>
                                    </div>
                                ) : (
                                    myVouchers.map((v, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white rounded-2xl p-4 flex items-center justify-between group animate-fadeIn"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black text-[#9d0b0f] bg-red-50 px-2 py-0.5 rounded uppercase">
                                                        {v.name}
                                                    </span>
                                                    <CheckCircle size={12} className="text-green-500" />
                                                </div>
                                                <p className="text-sm font-black text-[#3e2714] tracking-[0.1em] uppercase truncate">
                                                    Mã: {v.code}
                                                </p>
                                                <p className="text-[9px] text-gray-400 mt-0.5 italic">
                                                    {v.description}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => copyCode(v.code)}
                                                className="ml-4 p-2.5 bg-[#f7f4ef] text-[#3e2714] rounded-xl hover:bg-[#9d0b0f] hover:text-white transition-all shadow-sm"
                                                title="Sao chép mã"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showPopup && result && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-zoomIn border-4 border-[#faa519]">
                        <div className="bg-gradient-to-br from-[#9d0b0f] to-[#f39200] p-10 text-center text-white">
                            <Trophy size={60} className="mx-auto mb-4 text-yellow-300" />
                            <h3 className="text-2xl font-black uppercase">Chúc mừng!</h3>
                            <p className="text-sm opacity-90 mt-2 italic">
                                Bạn đã trúng phần quà:
                            </p>
                            <p className="text-4xl font-black mt-2 tracking-tighter uppercase">
                                {result.name}
                            </p>
                        </div>
                        <div className="p-8 text-center space-y-6">
                            <div className="bg-[#f7f4ef] p-5 rounded-2xl border-2 border-dashed border-[#9d0b0f]/30">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">
                                    Mã Voucher của bạn
                                </p>
                                <p className="text-3xl font-black text-[#9d0b0f] uppercase tracking-widest">
                                    {result.code}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    copyCode(result.code);
                                    setShowPopup(false);
                                }}
                                className="w-full bg-[#3e2714] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Navigation size={18} className="rotate-45" /> Sao chép & Dùng
                                ngay
                            </button>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="text-gray-400 text-xs font-bold underline uppercase tracking-widest"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .animate-zoomIn { animation: zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
        </div>
    );
};

export default LuckyWheel;
