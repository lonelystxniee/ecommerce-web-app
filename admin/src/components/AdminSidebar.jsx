import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Box,
  ShoppingCart,
  TicketPercent,
  LogOut,
  ShoppingBag,
} from "lucide-react";

const AdminSidebar = () => {
  const menuItems = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/users", icon: <Users size={20} />, label: "Quản lý người dùng" },
    { path: "/products", icon: <Box size={20} />, label: "Quản lý sản phẩm" },
    {
      path: "/orders",
      icon: <ShoppingCart size={20} />,
      label: "Quản lý đơn hàng",
    },
    {
      path: "/promotions",
      icon: <TicketPercent size={20} />,
      label: "Quản lý khuyến mãi",
    },
  ];

  return (
    <div className="w-64 bg-[#00b14f] min-h-screen text-white flex flex-col p-4 fixed left-0 top-0 z-50 shadow-xl">
      <div className="flex items-center gap-3 mb-10 px-2 pt-4">
        <div className="bg-white p-2 rounded-xl shadow-inner">
          <ShoppingBag className="text-[#00b14f]" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight uppercase tracking-tighter">
            Tạp Hóa Ông Từ
          </h1>
          <p className="text-[10px] opacity-70">Hệ thống quản trị v1.0</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-white text-[#00b14f] shadow-lg font-bold translate-x-1"
                  : "hover:bg-green-600 opacity-80 hover:opacity-100"
              }`
            }
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-red-500 transition-colors mt-auto mb-4 bg-green-700/30">
        <LogOut size={20} />
        <span className="font-medium text-sm">Đăng xuất hệ thống</span>
      </button>
    </div>
  );
};

export default AdminSidebar;
