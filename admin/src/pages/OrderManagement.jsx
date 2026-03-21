import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  Filter,
  RefreshCcw,
  Package,
  Trash2,
  X,
  User,
  MapPin,
  Truck,
  CheckCircle,
  Phone,
  Mail,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/orders/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // HÀM XỬ LÝ QUY TRÌNH (WORKFLOW)
  const handleWorkflow = async (orderId, action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/orders/${action}/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        alert(data.message || "Cập nhật thành công!");
        fetchOrders();
        setIsModalOpen(false);
      } else {
        alert("Lỗi: " + (data.message || "Không rõ nguyên nhân"));
      }
    } catch (error) {
      alert("Lỗi kết nối: " + error.message);
    }
  };

  const filteredOrders = orders.filter(
    (o) => {
      const name = (o.customerInfo && o.customerInfo.fullName) || "";
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o._id.includes(searchTerm)
      );
    },
  );

  // Pagination calculations
  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, orders]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // helper to determine pages to render (max 5 visible)
  const getVisiblePages = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 2) {
      start = 1;
      end = maxVisible;
    } else if (currentPage >= totalPages - 1) {
      start = totalPages - (maxVisible - 1);
      end = totalPages;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-gray-100 text-gray-500",
      CONFIRMED: "bg-blue-100 text-blue-600",
      PACKING: "bg-orange-100 text-orange-600",
      READY_TO_PICK: "bg-indigo-100 text-indigo-600",
      PICKING: "bg-purple-100 text-purple-600",
      DELIVERING: "bg-blue-600 text-white",
      COMPLETED: "bg-green-100 text-green-600",
      CANCELLED: "bg-red-100 text-red-600",
    };
    return styles[status] || "bg-gray-100 text-gray-500";
  };

  // Derived values for selected order totals
  const subtotalForSelected = selectedOrder
    ? (selectedOrder.items || []).reduce(
      (s, it) => s + (Number(it.price || 0) || 0) * (Number(it.quantity || 1) || 0),
      0,
    )
    : 0;
  const shippingFeeForSelected = selectedOrder && selectedOrder.shipping
    ? Number(selectedOrder.shipping.shippingFee || 0)
    : 0;
  const discountForSelected = selectedOrder
    ? Number(selectedOrder.discountAmount || 0)
    : 0;
  const computedTotalForSelected = selectedOrder
    ? Number(selectedOrder.totalPrice || subtotalForSelected + shippingFeeForSelected - discountForSelected)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b-2 border-[#9d0b0f] pb-4">
        <div>
          <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            Quản lý vận đơn
          </h2>
          <p className="text-[#88694f] font-medium italic">
            Quy trình: Xác nhận → Đóng gói → Bàn giao GHN
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-3 bg-white border border-[#9d0b0f]/20 rounded-2xl text-[#9d0b0f]"
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white/80 p-4 rounded-2xl border border-[#9d0b0f]/10">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-[#9d0b0f]" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 py-2.5 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#9d0b0f] text-white text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-8 py-5">Mã đơn</th>
              <th className="px-8 py-5">Khách hàng</th>
              <th className="px-8 py-5 text-center">Xử lý nội bộ (Shop)</th>
              <th className="px-8 py-5 text-center">Trạng thái vận chuyển</th>
              <th className="px-8 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedOrders.map((order) => (
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
                  <p className="text-[10px] text-gray-400 font-bold">
                    {order.customerInfo.phone}
                  </p>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex justify-center gap-2">
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => handleWorkflow(order._id, "confirm")}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold"
                      >
                        XÁC NHẬN
                      </button>
                    )}
                    {order.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleWorkflow(order._id, "pack")}
                        className="bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold"
                      >
                        ĐÓNG GÓI
                      </button>
                    )}
                    {order.status === "PACKING" && (
                      <button
                        onClick={() => handleWorkflow(order._id, "handover")}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold"
                      >
                        BÀN GIAO GHN
                      </button>
                    )}
                    {[
                      "READY_TO_PICK",
                      "PICKING",
                      "DELIVERING",
                      "COMPLETED",
                    ].includes(order.status) && (
                        <span className="text-green-600 font-black text-[10px] flex items-center gap-1">
                          <CheckCircle size={12} /> ĐÃ BÀN GIAO
                        </span>
                      )}
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${getStatusBadge(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 p-2.5 bg-blue-50 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4 px-4">
        <div className="text-sm text-[#88694f]">
          Trang {currentPage} / {totalPages} — Tổng {totalItems} đơn
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Prev page"
            className={`p-1 rounded text-gray-500 hover:text-gray-900 ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            {getVisiblePages().map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`px-3 py-1 text-sm font-bold ${p === currentPage ? 'bg-[#9d0b0f] text-white shadow-md rounded-md' : 'text-gray-700'}`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className={`p-1 rounded text-gray-500 hover:text-gray-900 ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-[#f7f4ef] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl border-2 border-[#9d0b0f] animate-zoomIn">
            <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center sticky top-0 z-20">
              <div>
                <h3 className="text-xl font-bold tracking-tight uppercase">
                  Chi tiết đơn hàng
                </h3>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                  Mã đơn: {selectedOrder._id}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-3">
              {/* Cột trái: Thông tin khách hàng */}
              <div className="space-y-6 lg:col-span-1">
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
                      <span className="italic leading-relaxed text-gray-600">
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
                    <p className="flex items-center gap-1 font-bold">
                      <Calendar size={12} /> Ngày đặt:{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString(
                        "vi-VN",
                      )}
                    </p>
                    <div className="p-3 mt-2 border border-orange-200 border-dashed bg-orange-50 rounded-xl">
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
                        <th className="py-4 text-center">Sản phẩm</th>
                        <th className="py-4 text-center">Giá</th>
                        <th className="py-4 text-center">SL</th>
                        <th className="py-4 pr-6 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="flex items-center gap-3 py-4 pl-6">
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
                          <td className="py-4 font-medium text-center">
                            {item.price.toLocaleString()}đ
                          </td>
                          <td className="py-4 font-black text-center">
                            x{item.quantity}
                          </td>
                          <td className="py-4 pr-6 text-right font-black text-[#9d0b0f]">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="p-4 bg-white border-t">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Phí vận chuyển:</span>
                      <span>{shippingFeeForSelected.toLocaleString()}đ</span>
                    </div>
                    {discountForSelected > 0 && (
                      <div className="flex justify-between text-sm text-green-600 mb-2">
                        <span>Giảm giá:</span>
                        <span>-{discountForSelected.toLocaleString()}đ</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Package size={20} />
                      <span className="text-xs font-bold tracking-widest uppercase">
                        Tổng cộng thanh toán
                      </span>
                    </div>
                    <span className="text-2xl font-black">
                      {computedTotalForSelected.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold">Mã GHN</div>
                    <div className="text-sm font-mono text-[#3e2714]">{selectedOrder.ghnOrderCode || selectedOrder.shipping?.ghnOrderCode || 'Chưa có'}</div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {!selectedOrder.ghnOrderCode && !selectedOrder.shipping?.ghnOrderCode && (
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const url = `${API_URL}/api/admin/orders/${selectedOrder._id}/ship`;
                            const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                            const d = await res.json();
                            if (d.success) {
                              alert('Đã tạo mã GHN: ' + (d.ghnOrderCode || ''));
                              fetchOrders();
                              setSelectedOrder((await fetch(`${API_URL}/api/orders/${selectedOrder._id}`).then(r => r.json())).order);
                            } else {
                              alert('Lỗi tạo GHN: ' + (d.message || ''));
                            }
                          } catch (e) {
                            alert('Lỗi kết nối');
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold"
                      >
                        Tạo GHN
                      </button>
                    )}

                    {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                      <button
                        onClick={async () => {
                          if (!confirm('Xác nhận hủy đơn này?')) return;
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${API_URL}/api/admin/orders/${selectedOrder._id}/cancel`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
                            const d = await res.json();
                            if (d.success) {
                              alert(d.message || 'Đã hủy đơn');
                              fetchOrders();
                              setIsModalOpen(false);
                            } else {
                              alert('Lỗi: ' + (d.message || 'Không thể hủy'));
                            }
                          } catch (e) {
                            alert('Lỗi kết nối');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold"
                      >
                        HỦY ĐƠN
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate(`/orders/track/${selectedOrder._id}`);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold"
                    >
                      Xem GHN
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-2xl bg-[#3e2714] text-white font-bold text-xs hover:bg-black transition-all"
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
