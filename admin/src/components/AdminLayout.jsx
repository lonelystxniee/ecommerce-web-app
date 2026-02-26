import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div
      className="flex min-h-screen font-sans text-[#3e2714] bg-[#f7f4ef]"
      style={{
        backgroundImage: `url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')`,
      }}
    >
      <AdminSidebar />
      {/* Nội dung bên phải */}
      <main className="flex-1 ml-64 p-8 min-h-screen relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
