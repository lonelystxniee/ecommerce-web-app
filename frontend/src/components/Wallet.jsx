import React, { useState, useEffect } from "react";
import {
  Wallet as WalletIcon,
  Plus,
  X,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5175/api/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBalance(data.balance);
    } catch (e) {
      console.error("Lỗi lấy số dư:", e);
    }
  };

  // Tải lại số dư mỗi khi mở Modal
  useEffect(() => {
    if (showModal) fetchBalance();
  }, [showModal]);

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleTopup = async () => {
    if (!amount || amount < 10000) return toast.error("Nạp tối thiểu 10.000đ");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5175/api/wallet/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.vnpUrl) {
        window.location.href = data.vnpUrl;
      } else {
        toast.error("Không thể tạo link thanh toán");
        setLoading(false);
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Nút bấm ở Header */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-[#f7f4ef] border-2 border-secondary/20 px-4 py-2 rounded-full hover:bg-white hover:border-secondary transition-all shadow-sm group"
      >
        <WalletIcon
          size={18}
          className="text-secondary group-hover:scale-110 transition-transform"
        />
        <span className="text-sm font-black text-primary">
          {balance.toLocaleString()}đ
        </span>
        <div className="bg-secondary text-white rounded-full p-0.5 shadow-sm">
          <Plus size={12} strokeWidth={3} />
        </div>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl border border-white/20 animate-zoomIn">
            {/* Header Modal */}
            <div className="bg-secondary p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <WalletIcon size={24} />
                </div>
                <div>
                  <h3 className="font-bold uppercase text-sm tracking-widest">
                    Ví điện tử
                  </h3>
                  <p className="text-[10px] opacity-70 uppercase font-medium">
                    Thanh toán an toàn & nhanh chóng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* KHỐI HIỂN THỊ SỐ DƯ HIỆN TẠI (LÀM RÕ Ở ĐÂY) */}
              <div className="relative overflow-hidden text-center p-8 bg-linear-to-br from-[#f7f4ef] to-[#fffcf7] rounded-[32px] border-2 border-dashed border-secondary/30">
                <p className="text-[11px] font-black uppercase text-stone-400 tracking-[0.2em] mb-2">
                  Số dư hiện có
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-primary tracking-tighter">
                    {balance.toLocaleString()}
                  </span>
                  <span className="text-xl font-bold text-secondary">đ</span>
                </div>
                {/* Trang trí icon mờ phía sau */}
                <WalletIcon
                  size={80}
                  className="absolute -bottom-4 -right-4 opacity-5 text-secondary rotate-12"
                />
              </div>

              {/* Phần nhập tiền */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-stone-500 uppercase ml-2 tracking-wider">
                  Số tiền muốn nạp (VNPay)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Nhập số tiền..."
                    className="w-full p-5 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:border-secondary focus:bg-white transition-all font-bold text-xl text-primary"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-stone-300">
                    VND
                  </span>
                </div>
              </div>

              {/* Gợi ý số tiền */}
              <div className="grid grid-cols-3 gap-3">
                {[50000, 100000, 500000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-3 border-2 rounded-2xl text-xs font-black transition-all ${
                      amount === val
                        ? "bg-secondary border-secondary text-white shadow-md shadow-secondary/30"
                        : "border-stone-100 text-stone-500 hover:border-secondary hover:text-secondary bg-white"
                    }`}
                  >
                    +{val / 1000}K
                  </button>
                ))}
              </div>

              {/* Nút nạp tiền */}
              <button
                onClick={handleTopup}
                disabled={loading}
                className="w-full bg-primary text-white py-5 rounded-3xl font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  <>
                    <ArrowUpRight size={20} strokeWidth={3} />
                    <span>Xác nhận nạp tiền</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-500" />
                Hệ thống thanh toán bảo mật VNPay
              </div>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `,
        }}
      />
    </div>
  );
};
export default Wallet;
