// admin/src/components/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* Thanh Sidebar cố định bên trái */}
      <AdminSidebar />

      {/* Nội dung bên phải sẽ thay đổi dựa theo URL */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
