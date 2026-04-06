import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from 'react-hot-toast';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import API_URL from "../config/apiConfig";
import CancellationModal from "../components/CancellationModal";

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchTracking = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/detail/${id}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data.success) {
        const sortedHistory = data.order.trackingHistory.sort(
          (a, b) => new Date(b.time) - new Date(a.time),
        );

        setOrder({ ...data.order, trackingHistory: sortedHistory });
      }
    } catch (e) {
      console.log("Đang chờ hành trình...");
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const getStepStatus = (status) => {
    const s = (status || "").toUpperCase();
    if (["COMPLETED"].includes(s)) return 4;
    if (["DELIVERING", "PICKING", "READY_TO_PICK"].includes(s)) return 3;
    if (["PACKING", "CONFIRMED"].includes(s)) return 2;
    if (["PENDING"].includes(s)) return 1;
    return 0;
  };

  const steps = [
    { label: "Đã đặt hàng", icon: <Package size={20} /> },
    { label: "Đang xử lý", icon: <Clock size={20} /> },
    { label: "Đang vận chuyển", icon: <Truck size={20} /> },
    { label: "Hoàn tất", icon: <CheckCircle size={20} /> },
  ];

  if (!order)
    return (
      <div className="min-h-screen bg-[#f7f4ef]/30 flex items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto text-[#9d0b0f] animate-spin mb-4" size={48} />
          <p className="italic text-stone-400 font-bold">Đang tìm kiếm hành trình...</p>
        </div>
      </div>
    );

  const currentStep = getStepStatus(order.status);

  return (
    <div className="min-h-screen bg-[#f7f4ef]/50 py-12 font-sans overflow-x-hidden">
      <div className="max-w-[1000px] mx-auto px-6">
        <Link
          to="/account?tab=orders"
          className="inline-flex items-center gap-2 text-[#9d0b0f] font-bold mb-8 hover:translate-x-1 transition-transform group"
        >
          <div className="p-2 rounded-full bg-white shadow-sm border border-stone-200 group-hover:bg-[#9d0b0f] group-hover:text-white transition-all">
            <ChevronLeft size={16} />
          </div>
          <span>Quay lại đơn hàng</span>
        </Link>

        {/* Stepper Header */}
        <div className="bg-white p-8 sm:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(157,11,15,0.05)] border border-stone-100 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-[#9d0b0f]/5 to-transparent rounded-full -mr-32 -mt-32 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-[#f39200]/10 text-[#f39200] text-[10px] font-black uppercase tracking-widest mb-2">
                Trạng thái vận đơn
              </span>
              <h1 className="text-4xl font-black text-[#9d0b0f] tracking-tighter">
                #{order._id?.slice(-8).toUpperCase()}
              </h1>
              {order.ghnOrderCode && (
                <div className="mt-2 text-sm font-bold text-gray-400 flex items-center justify-center md:justify-start gap-2">
                  Mã vận đơn: <span className="text-[#f39200] font-black">{order.ghnOrderCode}</span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full max-w-2xl">
              <div className="relative flex justify-between items-center px-4">
                {/* Progress Lines */}
                <div className="absolute left-8 right-8 top-5 h-1 bg-stone-100 -z-10">
                  <div
                    className="h-full bg-[#9d0b0f] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(157,11,15,0.4)]"
                    style={{ width: `${Math.max(0, (currentStep - 1) / (steps.length - 1)) * 100}%` }}
                  ></div>
                </div>

                {steps.map((step, idx) => {
                  const isActive = idx + 1 <= currentStep;
                  const isCurrent = idx + 1 === currentStep;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg
                        ${isActive ? 'bg-[#9d0b0f] text-white scale-110' : 'bg-white text-stone-300 border border-stone-100'}
                        ${isCurrent ? 'ring-4 ring-red-100 animate-pulse' : ''}
                      `}>
                        {step.icon}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider text-center
                        ${isActive ? 'text-[#9d0b0f]' : 'text-stone-300'}
                      `}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Lộ trình chi tiết */}
          <div className="lg:col-span-7">
            <div className="bg-white p-1 shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[48px] border border-stone-100 overflow-hidden h-full">
              <div className="p-8 pb-4">
                <h3 className="text-xl font-black text-[#3e2714] flex items-center gap-3 uppercase tracking-tighter">
                  <Clock className="text-[#9d0b0f]" /> Nhật ký hành trình
                </h3>
              </div>

              <div className="p-8 space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[51px] top-12 bottom-12 w-0.5 bg-linear-to-b from-[#9d0b0f]/20 via-stone-100 to-transparent"></div>

                {order.trackingHistory?.map((step, index) => (
                  <div key={index} className="relative pl-16 py-6 group transition-all">
                    {/* Timeline Node */}
                    <div className={`absolute left-[-5px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-xl border-4 border-white shadow-xl transition-all duration-500 z-10 scale-0 group-hover:scale-110 animate-scaleIn
                         ${index === 0 ? "bg-[#9d0b0f] ring-4 ring-red-100" : "bg-stone-300"}`}
                      style={{ left: '39px' }}
                    ></div>

                    <div className={`p-6 rounded-[32px] transition-all duration-300 border
                        ${index === 0
                        ? "bg-white border-[#9d0b0f]/20 shadow-[0_15px_40px_rgba(157,11,15,0.08)]"
                        : "bg-stone-50/30 border-transparent hover:bg-white hover:border-stone-100 hover:shadow-sm"}
                      `}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className={`text-base font-bold leading-tight mb-2
                              ${index === 0 ? "text-[#9d0b0f] text-lg" : "text-stone-700"}
                            `}>
                            {step.desc}
                          </p>
                          <div className="flex items-center gap-4 text-[11px] font-bold text-stone-400">
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(step.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="w-1 h-1 rounded-full bg-stone-200"></div>
                            <div>{new Date(step.time).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </div>

                        <div className={`p-3 rounded-2xl transition-all
                            ${index === 0 ? "bg-[#9d0b0f] text-white rotate-[360deg] duration-1000" : "bg-stone-100 text-stone-300"}
                          `}>
                          {step.status === "DELIVERED" || step.desc.includes("thành công")
                            ? <CheckCircle size={20} />
                            : <Truck size={20} />
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thông tin nhận hàng & Order Summary */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-10 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#9d0b0f]"></div>

              <h3 className="text-[#9d0b0f] font-black uppercase text-xs mb-8 flex items-center gap-2 tracking-widest">
                <MapPin size={18} /> Địa chỉ giao hàng
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-3xl font-black text-[#3e2714] leading-none mb-2">{order.customerInfo.fullName}</p>
                  <p className="text-lg font-bold text-stone-500 select-all">{order.customerInfo.phone}</p>
                </div>

                <div className="p-6 rounded-[32px] bg-stone-50 border border-stone-100 italic text-stone-600 leading-relaxed shadow-inner">
                  "{order.customerInfo.address}"
                </div>
              </div>

              {/* Nút hủy đơn (khách) */}
              {['PENDING', 'CONFIRMED', 'PACKING'].includes((order.status || '').toUpperCase()) && !order.ghnOrderCode && (
                <button
                  onClick={async () => {
                    setIsCancelModalOpen(true);
                  }}
                  className="w-full mt-8 py-4 rounded-2xl bg-stone-100 text-stone-400 font-bold hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                  Hủy đơn hàng này
                </button>
              )}
            </div>

            <div className="bg-[#3e2714] p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-16 -mr-16 blur-2xl group-hover:bg-white/10 transition-all"></div>

              <h3 className="text-stone-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-6">Tóm tắt đơn hàng</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Sản phẩm (x{order.items?.length || 0})</span>
                  <span className="text-white font-bold">{order.items?.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Phí vận chuyển</span>
                  <span className="text-white font-bold">{(order.shipping?.shippingFee || 0).toLocaleString()}đ</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Giảm giá</span>
                    <span className="text-green-400 font-bold">-{order.discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-6 flex justify-between items-end">
                <div>
                  <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest mb-1">Tổng cộng</p>
                  <p className="text-4xl font-black text-[#f39200] leading-none">
                    {(order.totalPrice || 0).toLocaleString()}đ
                  </p>
                </div>
                <Package className="text-stone-800" size={48} />
              </div>
            </div>
            {/* Order Images */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-stone-100">
              <h4 className="text-sm font-black text-stone-700 mb-4">Ảnh liên quan đơn hàng</h4>
              {order.orderImages && order.orderImages.length > 0 ? (
                <div className="flex gap-3 flex-wrap">
                  {order.orderImages.map((img, idx) => (
                    <a key={idx} href={img.url} target="_blank" rel="noreferrer" className="block w-28 h-28 bg-stone-50 rounded-lg overflow-hidden border">
                      <img src={img.url} alt={`order-${idx}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-stone-400 italic">Chưa có ảnh nào cho đơn hàng này.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CancellationFlow
        order={order}
        id={id}
        fetchTracking={fetchTracking}
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};

const CancellationFlow = ({ order, id, fetchTracking, isOpen, onClose }) => {
  const handleConfirm = async (reason) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders/cancel/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message || 'Đã hủy đơn thành công');
        fetchTracking();
      } else {
        toast.error('Lỗi: ' + (d.message || 'Không thể hủy'));
      }
    } catch (e) {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  return (
    <CancellationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      orderId={id}
    />
  );
};

export default OrderTracking;
