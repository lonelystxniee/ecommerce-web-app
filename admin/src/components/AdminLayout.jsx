import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div
      className="flex min-h-screen text-[#3e2714] bg-[#f7f4ef]"
      style={{
        backgroundImage: `url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')`,
      }}
    >
      <AdminSidebar />
      {/* Nội dung bên phải */}
      <main className="relative z-10 flex-1 min-h-screen p-8 ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
