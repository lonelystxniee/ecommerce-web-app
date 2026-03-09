import React, { useState, useEffect } from "react";
import { Search, Eye, Filter, X, MapPin, Phone, Mail, CreditCard, Calendar, Package } from "lucide-react";

const OrderManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = [
    {
      id: "#1001",
      customer: "Nguyễn Văn A",
      date: "2026-01-28",
      total: "₫245,000",
      status: "Chờ xử lý",
      pay: "Chưa thanh toán",
    },
    {
      id: "#1002",
      customer: "Trần Thị B",
      date: "2026-01-28",
      total: "₫180,000",
      status: "Đang giao",
      pay: "Đã thanh toán",
    },
    {
      id: "#1003",
      customer: "Lê Văn C",
      date: "2026-01-27",
      total: "₫350,000",
      status: "Hoàn thành",
      pay: "Đã thanh toán",
    },
    {
      id: "#1004",
      customer: "Phạm Thị D",
      date: "2026-01-27",
      total: "₫120,000",
      status: "Đã hủy",
      pay: "Đã hoàn tiền",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>

      <div className="flex gap-4">
        <div className="flex-1 relative bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn hàng, khách hàng..."
            className="w-full pl-12 py-3 bg-transparent outline-none"
          />
        </div>
        <button className="bg-white p-3 rounded-2xl border border-gray-100 text-gray-500 hover:bg-gray-50 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Mã đơn hàng</th>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Ngày đặt</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Thanh toán</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5 font-bold text-gray-700">
                  {order.id}
                </td>
                <td className="px-6 py-5 font-medium">{order.customer}</td>
                <td className="px-6 py-5 text-gray-500">{order.date}</td>
                <td className="px-6 py-5 font-bold">{order.total}</td>
                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${order.status === "Hoàn thành"
                      ? "bg-green-50 text-green-500"
                      : order.status === "Chờ xử lý"
                        ? "bg-orange-50 text-orange-500"
                        : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${order.pay === "Đã thanh toán"
                      ? "bg-green-50 text-green-500"
                      : "bg-red-50 text-red-400"
                      }`}
                  >
                    {order.pay}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="text-blue-500 p-2 hover:bg-blue-50 rounded-xl transition-colors">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- POPUP CHI TIẾT ĐƠN HÀNG --- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-[#f7f4ef] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl border-2 border-[#9d0b0f] animate-zoomIn">
            <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center sticky top-0 z-20">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Chi tiết đơn hàng
                </h3>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                  Mã đơn: {selectedOrder._id}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white/20 p-2 rounded-full hover:bg-white/40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cột trái: Thông tin khách hàng */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-200">
                  <h4 className="text-[#9d0b0f] font-black uppercase text-xs mb-4 flex items-center gap-2 border-b pb-2">
                    <User size={14} /> Thông tin khách nhận
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <User size={16} className="text-[#f39200] shrink-0" />
                      <span className="font-bold text-[#3e2714]">
                        {selectedOrder.customerInfo.fullName}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Phone size={16} className="text-[#f39200] shrink-0" />
                      <span className="font-medium">
                        {selectedOrder.customerInfo.phone}
                      </span>
                    </div>
                    {selectedOrder.customerInfo.email && (
                      <div className="flex gap-3">
                        <Mail size={16} className="text-[#f39200] shrink-0" />
                        <span className="text-gray-500 break-all">
                          {selectedOrder.customerInfo.email}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <MapPin size={16} className="text-[#f39200] shrink-0" />
                      <span className="text-gray-600 leading-relaxed italic">
                        {selectedOrder.customerInfo.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-200">
                  <h4 className="text-[#9d0b0f] font-black uppercase text-xs mb-4 flex items-center gap-2 border-b pb-2">
                    <CreditCard size={14} /> Thanh toán & Ghi chú
                  </h4>
                  <div className="space-y-3 text-xs">
                    <p className="font-bold">
                      Phương thức:{" "}
                      <span className="text-[#f39200]">
                        {selectedOrder.paymentMethod}
                      </span>
                    </p>
                    <p className="font-bold flex items-center gap-1">
                      <Calendar size={12} /> Ngày đặt:{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString(
                        "vi-VN",
                      )}
                    </p>
                    <div className="bg-orange-50 p-3 rounded-xl border border-dashed border-orange-200 mt-2">
                      <p className="text-[10px] font-bold text-[#88694f] uppercase mb-1">
                        Ghi chú của khách:
                      </p>
                      <p className="italic text-[#3e2714]">
                        {selectedOrder.customerInfo.note || "Không có ghi chú"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải: Danh sách sản phẩm */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f7f4ef] border-b">
                      <tr className="text-[10px] font-black uppercase text-gray-400">
                        <th className="py-4 pl-6 text-left">Sản phẩm</th>
                        <th className="py-4 text-center">Giá</th>
                        <th className="py-4 text-center">SL</th>
                        <th className="py-4 pr-6 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-4 pl-6 flex items-center gap-3">
                            <img
                              src={
                                item.image || (item.images && item.images[0])
                              }
                              className="w-12 h-12 rounded-lg object-contain bg-[#f7f4ef]"
                              alt=""
                            />
                            <div>
                              <p className="font-bold text-[#3e2714] line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium italic">
                                {item.label || "Mặc định"}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 text-center font-medium">
                            {item.price.toLocaleString()}đ
                          </td>
                          <td className="py-4 text-center font-black">
                            x{item.quantity}
                          </td>
                          <td className="py-4 pr-6 text-right font-black text-[#9d0b0f]">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="p-6 border-t bg-white/90 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm">
                      <span>Phí vận chuyển:</span>
                      <span className="font-bold text-[#00b14f] uppercase text-[12px]">
                        {selectedOrder.shipping && typeof selectedOrder.shipping.shippingFee !== 'undefined' && selectedOrder.shipping.shippingFee !== null
                          ? selectedOrder.shipping.shippingFee.toLocaleString() + 'đ'
                          : 'Chưa tính'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Package size={20} />
                      <span className="font-bold uppercase tracking-widest text-xs">
                        Tổng cộng thanh toán
                      </span>
                    </div>
                    <span className="text-2xl font-black">
                      {selectedOrder.totalPrice.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  {/* Đã loại bỏ nút IN HÓA ĐƠN ở đây */}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-10 py-3 rounded-2xl bg-[#3e2714] text-white font-bold text-xs hover:bg-black transition-all"
                  >
                    ĐÓNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
