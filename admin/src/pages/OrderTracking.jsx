import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, MapPin, ChevronLeft, CreditCard } from "lucide-react";
// Note: I will use the actual icon names from lucide-react as seen in the previous view_file
import * as Lucide from "lucide-react";

const { Package: IconPackage, Truck: IconTruck, CheckCircle: IconCheck, Clock: IconClock, MapPin: IconMap, ChevronLeft: IconBack, CreditCard: IconCard } = Lucide;

const OrderTracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

    const fetchTracking = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/orders/detail/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) return;

            const data = await res.json();
            if (data.success) {
                const sortedHistory = (data.order.trackingHistory || []).sort(
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
        { label: "Đã đặt", icon: <IconPackage size={20} /> },
        { label: "Xử lý", icon: <IconClock size={20} /> },
        { label: "Vận chuyển", icon: <IconTruck size={20} /> },
        { label: "Hoàn tất", icon: <IconCheck size={20} /> },
    ];

    if (!order) return (
        <div className="min-h-screen bg-[#f7f4ef]/30 flex items-center justify-center">
            <div className="text-center">
                <IconClock className="mx-auto text-[#9d0b0f] animate-spin mb-4" size={48} />
                <p className="italic text-stone-400 font-bold">Đang tải hành trình đơn hàng...</p>
            </div>
        </div>
    );

    const currentStep = getStepStatus(order.status);

    return (
        <div className="min-h-screen bg-[#f7f4ef]/30 py-12 font-sans overflow-x-hidden">
            <div className="max-w-[1000px] mx-auto px-6">
                <Link to="/orders" className="inline-flex items-center gap-2 text-[#9d0b0f] font-bold mb-8 hover:translate-x-1 transition-transform group">
                    <div className="p-2 rounded-full bg-white shadow-sm border border-stone-200 group-hover:bg-[#9d0b0f] group-hover:text-white transition-all">
                        <IconBack size={16} />
                    </div>
                    <span>Trở lại danh sách</span>
                </Link>

                <div className="bg-white p-8 sm:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(157,11,15,0.05)] border border-stone-100 mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-[#9d0b0f]/5 to-transparent rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left">
                            <span className="inline-block px-3 py-1 rounded-full bg-[#f39200]/10 text-[#f39200] text-[10px] font-black uppercase tracking-widest mb-2">Quản trị vận đơn</span>
                            <h2 className="text-4xl font-black text-[#9d0b0f] tracking-tighter">#{order._id?.slice(-8).toUpperCase()}</h2>
                            {order.ghnOrderCode && (
                                <p className="mt-2 text-sm font-bold text-gray-400 flex items-center justify-center md:justify-start gap-2">
                                    GHN Tracking: <span className="text-[#f39200] font-black">{order.ghnOrderCode}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex-1 w-full max-w-2xl">
                            <div className="relative flex justify-between items-center px-4">
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
                                            <span className={`text-[10px] font-black uppercase tracking-wider text-center ${isActive ? 'text-[#9d0b0f]' : 'text-stone-300'}`}>
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
                    <div className="lg:col-span-7">
                        <div className="bg-white p-1 shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[48px] border border-stone-100 overflow-hidden h-full">
                            <div className="p-8 pb-4">
                                <h3 className="text-xl font-black text-[#3e2714] flex items-center gap-3 uppercase tracking-tighter">
                                    <IconClock className="text-[#9d0b0f]" /> Lịch sử cập nhật
                                </h3>
                            </div>

                            <div className="p-8 space-y-0 relative">
                                <div className="absolute left-[51px] top-12 bottom-12 w-0.5 bg-linear-to-b from-[#9d0b0f]/20 via-stone-100 to-transparent"></div>

                                {order.trackingHistory?.map((step, index) => (
                                    <div key={index} className="relative pl-16 py-6 group transition-all">
                                        <div className={`absolute left-[39px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-xl border-4 border-white shadow-xl transition-all duration-500 z-10 scale-0 group-hover:scale-110 animate-scaleIn
                                            ${index === 0 ? "bg-[#9d0b0f] ring-4 ring-red-100" : "bg-stone-300"}`}
                                        ></div>

                                        <div className={`p-6 rounded-[32px] transition-all duration-300 border
                                            ${index === 0
                                                ? "bg-white border-[#9d0b0f]/20 shadow-[0_15px_40px_rgba(157,11,15,0.08)]"
                                                : "bg-stone-50/30 border-transparent hover:bg-white hover:border-stone-100 hover:shadow-sm"}
                                        `}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <p className={`text-base font-bold leading-tight mb-2 ${index === 0 ? "text-[#9d0b0f] text-lg" : "text-stone-700"}`}>
                                                        {step.desc}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-[11px] font-bold text-stone-400">
                                                        <div className="flex items-center gap-1"><IconClock size={12} /> {new Date(step.time).toLocaleString("vi-VN")}</div>
                                                    </div>
                                                </div>
                                                <div className={`p-3 rounded-2xl transition-all ${index === 0 ? "bg-[#9d0b0f] text-white rotate-[360deg] duration-1000" : "bg-stone-100 text-stone-300"}`}>
                                                    {step.status === "DELIVERED" || step.desc.includes("thành công") ? <IconCheck size={20} /> : <IconTruck size={20} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white p-10 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-[#9d0b0f]"></div>
                            <h3 className="text-[#9d0b0f] font-black uppercase text-xs mb-8 flex items-center gap-2 tracking-widest"><IconMap size={18} /> Điểm đến giao hàng</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-3xl font-black text-[#3e2714] leading-none mb-2">{order.customerInfo.fullName}</p>
                                    <p className="text-lg font-bold text-stone-500">{order.customerInfo.phone}</p>
                                </div>
                                <div className="p-6 rounded-[32px] bg-stone-50 border border-stone-100 italic text-stone-600 leading-relaxed shadow-inner">
                                    {order.customerInfo.address}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#3e2714] p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-16 -mr-16 blur-2xl"></div>
                            <h3 className="text-stone-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-6">Chi tiết thanh toán</h3>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-400">Giá trị hàng hóa</span>
                                    <span className="text-white font-bold">{order.items?.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-400">Phí giao hàng</span>
                                    <span className="text-white font-bold">{(order.shipping?.shippingFee || 0).toLocaleString()}đ</span>
                                </div>
                            </div>
                            <div className="border-t border-white/10 pt-6 flex justify-between items-end">
                                <div>
                                    <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest mb-1">Tổng thu hộ (COD)</p>
                                    <p className="text-4xl font-black text-[#f39200] leading-none">{(order.totalPrice || 0).toLocaleString()}đ</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-3xl text-[#f39200] border border-white/10"><IconCard size={32} /></div>
                            </div>
                        </div>
                        {/* Images + Upload (Admin) */}
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100">
                            <h4 className="text-sm font-black text-stone-700 mb-4">Ảnh đơn hàng / Ghi chú</h4>
                            <div className="mb-4">
                                {order.orderImages && order.orderImages.length > 0 ? (
                                    <div className="flex gap-2 flex-wrap">
                                        {order.orderImages.map((img, i) => (
                                            <a key={i} href={img.url} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-lg overflow-hidden border">
                                                <img src={img.url} alt={`order-${i}`} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-stone-400 italic">Chưa có ảnh</div>
                                )}
                            </div>

                            <div>
                                <label className="inline-flex items-center gap-2">
                                    <input id="admin-upload" type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                        const f = e.target.files && e.target.files[0];
                                        if (!f) return;
                                        const token = localStorage.getItem('token');
                                        const fd = new FormData();
                                        fd.append('image', f);
                                        try {
                                            const res = await fetch(`${API_URL}/api/orders/${order._id}/images`, {
                                                method: 'POST',
                                                headers: token ? { Authorization: `Bearer ${token}` } : {},
                                                body: fd,
                                            });
                                            const d = await res.json();
                                            if (d.success) {
                                                alert('Upload thành công');
                                                window.location.reload();
                                            } else alert('Lỗi: ' + (d.message || 'Upload thất bại'))
                                        } catch (err) { alert('Lỗi kết nối') }
                                    }} />
                                    <button onClick={() => document.getElementById('admin-upload').click()} className="px-4 py-2 bg-[#9d0b0f] text-white rounded-xl font-bold">Tải ảnh lên</button>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
