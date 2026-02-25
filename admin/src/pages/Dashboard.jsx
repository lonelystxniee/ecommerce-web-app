import React from "react";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      label: "Tổng đơn hàng",
      value: "1,234",
      icon: <ShoppingCart className="text-blue-500" />,
      trend: "+12.5%",
      color: "bg-blue-50",
    },
    {
      label: "Doanh thu",
      value: "₫45,2M",
      icon: <DollarSign className="text-green-500" />,
      trend: "+8.2%",
      color: "bg-green-50",
    },
    {
      label: "Khách hàng",
      value: "892",
      icon: <Users className="text-purple-500" />,
      trend: "+5.1%",
      color: "bg-purple-50",
    },
    {
      label: "Sản phẩm",
      value: "456",
      icon: <Package className="text-orange-500" />,
      trend: "-2.4%",
      color: "bg-orange-50",
    },
  ];

  const recentOrders = [
    {
      id: "#1001",
      customer: "Nguyễn Văn A",
      amount: "₫401,988",
      status: "Đang xử lý",
    },
    {
      id: "#1002",
      customer: "Trần Thị B",
      amount: "₫438,461",
      status: "Đang xử lý",
    },
    {
      id: "#1003",
      customer: "Lê Văn C",
      amount: "₫467,841",
      status: "Đang xử lý",
    },
    {
      id: "#1004",
      customer: "Phạm Thị D",
      amount: "₫436,155",
      status: "Đang xử lý",
    },
  ];

  const categories = [
    { name: "Tất cả", icon: "🛒" },
    { name: "Rau củ", icon: "🥬" },
    { name: "Trái cây", icon: "🍎" },
    { name: "Thịt cá", icon: "🥩" },
    { name: "Đồ khô", icon: "🍜" },
    { name: "Gia vị", icon: "🧂" },
    { name: "Nước uống", icon: "🥤" },
    { name: "Hàng gia dụng", icon: "🏠" },
  ];

  return (
    <div className="space-y-8">
      {/* Banner chào mừng màu xanh */}
      <div className="bg-[#00b14f] p-10 rounded-3xl text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 tracking-tight">
            Thực phẩm tươi mỗi ngày
          </h2>
          <p className="text-lg opacity-90 mb-6 font-medium">
            Giao nhanh – Giá như chợ
          </p>
          <div className="flex flex-wrap gap-3">
            {["Giao trong 1 giờ", "Tươi ngon đảm bảo", "Giá cả hợp lý"].map(
              (tag, i) => (
                <span
                  key={i}
                  className="bg-white/20 px-4 py-2 rounded-full text-xs font-bold border border-white/30 flex items-center gap-2 backdrop-blur-md"
                >
                  <CheckCircle size={14} /> {tag}
                </span>
              ),
            )}
          </div>
        </div>
        {/* Trang trí hình tròn mờ */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className={`${stat.color} p-4 rounded-2xl`}>{stat.icon}</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                <TrendingUp size={12} /> {stat.trend}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black mt-1 text-gray-800">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách đơn hàng gần đây */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">Đơn hàng gần đây</h3>
          <div className="space-y-4">
            {recentOrders.map((order, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="font-bold text-gray-400 text-sm">
                    {order.id}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">Đơn hàng</p>
                    <p className="text-xs text-gray-400 font-medium">
                      {order.customer}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-sm">
                    {order.amount}
                  </p>
                  <span className="text-[10px] bg-orange-100 text-orange-500 px-2 py-1 rounded-lg font-bold uppercase">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danh mục sản phẩm nhanh */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">Danh mục sản phẩm</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-green-50 transition-colors cursor-pointer group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="text-[10px] font-bold text-gray-500">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
