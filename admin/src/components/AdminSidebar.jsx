/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Box, ShoppingCart, TicketPercent, LogOut, ShoppingBag, Layers, MessageSquare, Shield, ClipboardList, DollarSign, Newspaper, Layout, Menu, X } from 'lucide-react'

const AdminSidebar = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/users', icon: <Users size={20} />, label: 'Quản lý người dùng' },
    { path: '/admins', icon: <Shield size={20} />, label: 'Quản trị viên' },
    { path: '/products', icon: <Box size={20} />, label: 'Quản lý sản phẩm' },
    {
      path: '/orders',
      icon: <ShoppingCart size={20} />,
      label: 'Quản lý đơn hàng',
    },
    {
      path: '/revenue',
      icon: <DollarSign size={20} />,
      label: 'Quản lý doanh thu',
    },
    {
      path: '/promotions',
      icon: <TicketPercent size={20} />,
      label: 'Quản lý khuyến mãi',
    },
    {
      path: '/categories',
      icon: <Layers size={20} />,
      label: 'Quản lý danh mục',
    },
    {
      path: '/warehouse',
      icon: <ShoppingBag size={20} />,
      label: 'Quản lý kho hàng',
    },
    {
      path: '/reviews',
      icon: <MessageSquare size={20} />,
      label: 'Quản lý đánh giá',
    },
    {
      path: '/news-video',
      icon: <Newspaper size={20} />,
      label: 'Quản lý Tin tức & Video',
    },
    {
      path: '/ads',
      icon: <Layout size={20} />,
      label: 'Quản lý Quảng cáo',
    },
    {
      path: '/activities',
      icon: <ClipboardList size={20} />,
      label: 'Nhật ký hệ thống',
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button onClick={() => setIsOpen(true)} className="lg:hidden fixed top-4 left-4 z-[200] p-2.5 bg-[#800a0d] text-white rounded-xl shadow-lg" aria-label="Mở menu">
        <Menu size={22} />
      </button>

      {/* Overlay (mobile only) */}
      {isOpen && <div className="lg:hidden fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        className={`
          w-64 bg-[#800a0d] min-h-screen text-white flex flex-col p-4
          fixed left-0 top-0 z-[160] shadow-2xl border-r border-[#faa519]/30
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Close button (mobile only) */}
        <button onClick={() => setIsOpen(false)} className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#9d0b0f] text-white/70 hover:text-white" aria-label="Đóng menu">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 px-2 pt-4 mb-10">
          <div className="p-2 bg-white shadow-inner rounded-xl">
            <ShoppingBag className="text-[#9d0b0f]" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tighter uppercase">ClickGo Admin</h1>
            <p className="text-[10px] opacity-70 text-[#faa519] font-bold">Hệ thống quản trị tinh hoa</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 ">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-[#f39200] text-white shadow-lg font-bold translate-x-2' : 'hover:bg-[#9d0b0f] hover:translate-x-1 opacity-80 hover:opacity-100'
                }`
              }
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 mt-auto mb-4 transition-colors rounded-xl hover:bg-black bg-black/20 text-white/80">
          <LogOut size={20} />
          <span className="text-sm font-medium">Thoát hệ thống</span>
        </button>
      </div>
    </>
  )
}

export default AdminSidebar
