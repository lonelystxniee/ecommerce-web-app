import React from "react";
import { Search, Eye, Filter } from "lucide-react";

const OrderManagement = () => {
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
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      order.status === "Hoàn thành"
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
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      order.pay === "Đã thanh toán"
                        ? "bg-green-50 text-green-500"
                        : "bg-red-50 text-red-400"
                    }`}
                  >
                    {order.pay}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="text-blue-500 p-2 hover:bg-blue-50 rounded-xl transition-colors">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
