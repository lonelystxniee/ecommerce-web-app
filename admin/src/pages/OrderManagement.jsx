import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Filter,
  RefreshCcw,
  Package,
  Trash2,
  X,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Calendar,
} from "lucide-react";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE CHI TIẾT ĐƠN HÀNG ---
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5175/api/orders/all", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5175/api/orders/status/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const data = await response.json();
      if (data.success) {
        alert("Cập nhật trạng thái thành công!");
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      alert("Lỗi kết nối server!");
    }
  };

  const openDetail = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customerInfo.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) || order._id.includes(searchTerm),
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-[#f39200]";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-600";
      case "SHIPPING":
        return "bg-purple-100 text-purple-600";
      case "COMPLETED":
        return "bg-green-100 text-green-600";
      case "CANCELLED":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#9d0b0f] pb-4">
        <div>
          <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            Quản lý đơn hàng
          </h2>
          <p className="text-[#88694f] font-medium italic">
            Theo dõi và điều phối đơn hàng ClickGo
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-3 bg-white border border-[#9d0b0f]/20 rounded-2xl text-[#9d0b0f]"
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tìm kiếm */}
      <div className="flex gap-4">
        <div className="flex-1 relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#9d0b0f]/10">
          <Search
            className="absolute left-4 top-3.5 text-[#9d0b0f]"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm theo tên khách hoặc mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 py-3.5 bg-transparent outline-none text-[#3e2714] text-sm"
          />
        </div>
      </div>

      {/* Bảng Đơn Hàng */}
      <div className="bg-white/90 backdrop-blur-sm rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#9d0b0f] text-white text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-8 py-5">Mã đơn</th>
              <th className="px-8 py-5">Khách hàng</th>
              <th className="px-8 py-5">Sản phẩm</th>
              <th className="px-8 py-5">Tổng tiền</th>
              <th className="px-8 py-5">Trạng thái</th>
              <th className="px-8 py-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-20 text-gray-400 italic"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-[#f7f4ef]/50 transition-colors"
                >
                  <td className="px-8 py-6 font-bold text-[#9d0b0f]">
                    #{order._id.substring(order._id.length - 6).toUpperCase()}
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-[#3e2714]">
                      {order.customerInfo.fullName}
                    </p>
                    <p className="text-[10px] text-[#88694f] font-bold">
                      {order.customerInfo.phone}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-medium bg-stone-100 px-2 py-1 rounded-lg">
                      {order.items.length} món
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-[#3e2714]">
                    {order.totalPrice.toLocaleString()}đ
                  </td>
                  <td className="px-8 py-6">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateStatus(order._id, e.target.value)
                      }
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border-none cursor-pointer ${getStatusStyle(order.status)}`}
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="SHIPPING">Đang giao</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => openDetail(order)}
                      className="text-blue-500 p-2.5 bg-blue-50 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
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
