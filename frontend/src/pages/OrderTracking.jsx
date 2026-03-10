import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import API_URL from "../config/apiConfig";

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);


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

  if (!order)
    return (
      <div className="p-20 italic text-center">Đang tìm kiếm hành trình...</div>
    );

  return (
    <div className="min-h-screen py-10 font-sans">
      <div className="max-w-[1200px] mx-auto px-4">
        <Link
          to="/account?tab=orders"
          className="flex items-center gap-2 text-[#9d0b0f] font-bold mb-6 hover:underline"
        >
          <ChevronLeft size={20} /> Quay lại đơn hàng của tôi
        </Link>

        <div className="flex items-center justify-between p-8 mb-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              Mã đơn hàng
            </p>
            <h2 className="text-2xl font-black text-[#9d0b0f]">
              #{order._id?.slice(-8).toUpperCase()}
            </h2>
            {order.ghnOrderCode && (
              <p className="mt-1 text-xs font-bold text-gray-500">
                Mã GHN: <span className="text-[#f39200]">{order.ghnOrderCode}</span>
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">
              Trạng thái hiện tại
            </p>
            <span className="px-4 py-1.5 bg-orange-100 text-[#f39200] rounded-full font-black text-xs uppercase">
              {order.status}
            </span>
          </div>
        </div>

        <div className="p-10 bg-white border border-gray-100 shadow-xl rounded-3xl">
          <div className="relative border-l-2 border-[#9d0b0f]/20 ml-6 space-y-12">
            {order.trackingHistory?.map((step, index) => (
              <div key={index} className="relative pl-10">
                <div
                  className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-md
      ${index === 0 ? "bg-[#9d0b0f] ring-4 ring-red-100 animate-pulse" : "bg-gray-300"}`}
                />

                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-base font-bold ${index === 0 ? "text-[#9d0b0f]" : "text-gray-500"}`}
                    >
                      {step.desc}
                    </p>
                    <p className="flex items-center gap-1 mt-1 text-xs font-medium text-gray-400">
                      <Clock size={12} />{" "}
                      {new Date(step.time).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <div
                    className={index === 0 ? "text-[#f39200]" : "text-gray-300"}
                  >
                    {step.status === "DELIVERED" ||
                      step.desc.includes("thành công") ? (
                      <CheckCircle size={24} />
                    ) : (
                      <Truck size={24} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-dashed border-[#9d0b0f]/30">
          <h3 className="text-[#9d0b0f] font-black uppercase text-xs mb-4 flex items-center gap-2">
            <MapPin size={18} /> Địa chỉ nhận hàng
          </h3>
          <p className="font-bold text-[#3e2714] text-lg">
            {order.customerInfo.fullName}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {order.customerInfo.phone}
          </p>
          <p className="mt-2 text-sm italic text-gray-600">
            {order.customerInfo.address}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
