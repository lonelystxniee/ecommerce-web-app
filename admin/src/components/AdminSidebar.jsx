import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Box,
  ShoppingCart,
  TicketPercent,
  LogOut,
  ShoppingBag,
  Layers,
  MessageSquare,
  Shield,
  ClipboardList,
  DollarSign,
  Newspaper,
  Layout,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const menuItems = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/users", icon: <Users size={20} />, label: "Quản lý người dùng" },
    { path: "/admins", icon: <Shield size={20} />, label: "Quản trị viên" },
    { path: "/products", icon: <Box size={20} />, label: "Quản lý sản phẩm" },
    {
      path: "/orders",
      icon: <ShoppingCart size={20} />,
      label: "Quản lý đơn hàng",
    },
    {
      path: "/revenue",
      icon: <DollarSign size={20} />,
      label: "Quản lý doanh thu",
    },
    {
      path: "/promotions",
      icon: <TicketPercent size={20} />,
      label: "Quản lý khuyến mãi",
    },
    {
      path: "/categories",
      icon: <Layers size={20} />,
      label: "Quản lý danh mục",
    },
    {
      path: "/reviews",
      icon: <MessageSquare size={20} />,
      label: "Quản lý đánh giá",
    },
    {
      path: "/news-video",
      icon: <Newspaper size={20} />,
      label: "Quản lý Tin tức & Video",
    },
    {
      path: "/ads",
      icon: <Layout size={20} />,
      label: "Quản lý Quảng cáo",
    },
    {
      path: "/activities",
      icon: <ClipboardList size={20} />,
      label: "Nhật ký hệ thống",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/"; // Quay về trang khách
  };

  return (
    <div className="w-64 bg-[#800a0d] min-h-screen text-white flex flex-col p-4 fixed left-0 top-0 z-50 shadow-2xl border-r border-[#faa519]/30">
      <div className="flex items-center gap-3 mb-10 px-2 pt-4">
        <div className="bg-white p-2 rounded-xl shadow-inner">
          <ShoppingBag className="text-[#9d0b0f]" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight uppercase tracking-tighter">
            ClickGo Admin
          </h1>
          <p className="text-[10px] opacity-70 text-[#faa519] font-bold">
            Hệ thống quản trị tinh hoa
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive
                ? "bg-[#f39200] text-white shadow-lg font-bold translate-x-2"
                : "hover:bg-[#9d0b0f] hover:translate-x-1 opacity-80 hover:opacity-100"
              }`
            }
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-black transition-colors mt-auto mb-4 bg-black/20 text-white/80"
      >
        <LogOut size={20} />
        <span className="font-medium text-sm">Thoát hệ thống</span>
      </button>
    </div>
  );
};

export default AdminSidebar;
