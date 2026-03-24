import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const CancellationModal = ({ isOpen, onClose, onConfirm, orderId }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-zoomIn border-t-8 border-red-600">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Hủy đơn hàng</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-stone-500 text-sm font-medium mb-6 leading-relaxed">
            Bạn đang yêu cầu hủy đơn hàng <span className="font-black text-[#3e2714]">#{orderId?.slice(-8).toUpperCase()}</span>. 
            Vui lòng cho ClickGo biết lý do hủy để chúng mình cải thiện dịch vụ nhé.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block pl-1 text-[11px] font-black text-stone-400 uppercase tracking-widest">
                Lý do hủy đơn
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Đặt nhầm sản phẩm, đổi ý không mua nữa..."
                required
                className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-red-600 focus:bg-white transition-all font-bold text-[#3e2714] min-h-[120px] resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-stone-100 text-stone-500 font-bold hover:bg-stone-200 transition-all uppercase text-xs tracking-widest"
              >
                Để sau
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="flex-[2] py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95 disabled:opacity-50 disabled:scale-100 uppercase text-xs tracking-widest"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận hủy đơn'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
