import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5175/api/orders/all");
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
      const response = await fetch(
        `http://localhost:5175/api/orders/${action}/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await response.json();
      if (data.success) {
        alert("Cập nhật quy trình thành công!");
        fetchOrders();
        setIsModalOpen(false);
      }
    } catch (error) {
      alert("Lỗi kết nối!");
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.customerInfo.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) || o._id.includes(searchTerm),
  );

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
        <table className="w-full text-left text-sm">
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
            {filteredOrders.map((order) => (
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
                  <div className="flex gap-2 justify-center">
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

      {/* MODAL CHI TIẾT GIỮ NGUYÊN NHƯ CŨ NHƯNG THÊM NÚT ĐIỀU HƯỚNG NẾU CẦN */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-[#f7f4ef] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl border-2 border-[#9d0b0f]">
            <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-bold uppercase">
                Chi tiết đơn hàng #
                {selectedOrder._id.substring(selectedOrder._id.length - 6)}
              </h3>
              <X
                className="cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <div className="p-8">
              {/* ... Bạn copy nội dung Modal cũ của bạn vào đây ... */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-3 rounded-2xl bg-[#3e2714] text-white font-bold text-xs uppercase"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
