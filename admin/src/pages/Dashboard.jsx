import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState({
    orders: [],
    totalRevenue: 0,
    userCount: 0,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/orders/all`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          const total = json.orders.reduce(
            (acc, curr) => acc + curr.totalPrice,
            0,
          );
          setData({
            orders: json.orders.slice(0, 5), // Lấy 5 đơn mới nhất
            totalRevenue: total,
            userCount: 10, // Giả lập hoặc gọi API User
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      label: "Tổng đơn hàng",
      value: data.orders.length,
      icon: <ShoppingCart className="text-blue-500" />,
      trend: "+12%",
      color: "bg-blue-50",
    },
    {
      label: "Doanh thu",
      value: `₫${(data.totalRevenue / 1000000).toFixed(1)}M`,
      icon: <DollarSign className="text-green-500" />,
      trend: "+8%",
      color: "bg-green-50",
    },
    {
      label: "Khách hàng",
      value: data.userCount,
      icon: <Users className="text-purple-500" />,
      trend: "+5%",
      color: "bg-purple-50",
    },
    {
      label: "Sản phẩm",
      value: "45",
      icon: <Package className="text-orange-500" />,
      trend: "0%",
      color: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Hệ thống Quản trị ClickGo
        </h2>
        <p className="text-gray-500 font-medium">
          "Tốc độ - Tươi ngon - Tận tâm"
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100"
          >
            <div className="flex justify-between">
              <div className={`${stat.color} p-4 rounded-2xl`}>{stat.icon}</div>
              <div className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp size={12} /> {stat.trend}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-gray-400 text-xs font-bold uppercase">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-gray-800">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Đơn hàng gần đây */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6">Đơn hàng mới nhất</h3>
        <div className="space-y-4">
          {data.orders.map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
            >
              <div>
                <p className="font-bold text-sm">
                  Khách hàng: {order.customerInfo.fullName}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#800a0d]">
                  {order.totalPrice.toLocaleString()}đ
                </p>
                <span className="text-[10px] bg-orange-100 text-orange-500 px-2 py-1 rounded-lg font-bold uppercase">
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
