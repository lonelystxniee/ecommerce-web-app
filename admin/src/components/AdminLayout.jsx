import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import ChatPanel from '../pages/ChatPanel'
import NotificationDropdown from './NotificationDropdown'
import { Toaster } from 'react-hot-toast'

const AdminLayout = () => {
  return (
    <div
      className="flex min-h-screen text-[#3e2714] bg-[#f7f4ef]"
      style={{
        backgroundImage: `url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')`,
      }}
    >
      <AdminSidebar />
      {/* Nội dung bên phải — trên mobile không cần margin vì sidebar là overlay */}
      <main className="relative z-10 flex flex-col flex-1 min-h-screen min-w-0 overflow-x-auto p-4 md:p-8 lg:ml-64">
        {/* Spacer cho mobile hamburger button */}
        <div className="h-14 lg:hidden" />
        <div className="flex justify-end w-full mb-4">
          <NotificationDropdown />
        </div>
        <Outlet />
        <ChatPanel />
        <Toaster position="top-right" />
      </main>
    </div>
  )
}

export default AdminLayout
