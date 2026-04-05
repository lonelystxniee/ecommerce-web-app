import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getSocket } from '../utils/socket'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175'

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) {
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (err) {
        console.error('Lỗi khi tải thông báo:', err)
      }
    }
    fetchNotifications()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const socket = getSocket()
    const handleNewOrderObj = (data) => {
      toast.success(data.message || `Có đơn hàng mới!`, { duration: 6000 })
      setNotifications((prev) => [data, ...prev].slice(0, 100))
      setUnreadCount((prev) => prev + 1)
    }

    // Listen only to admin notifications
    socket.on('new_order', handleNewOrderObj)
    return () => {
      socket.off('new_order', handleNewOrderObj)
    }
  }, [])

  const normalizeLink = (link) => {
    if (!link) return ''
    // Xử lý link cũ từ database: /orders?highlight=ID -> /order-tracking/ID
    if (link.includes('highlight=')) {
      const id = link.split('highlight=')[1]
      return `/order-tracking/${id}`
    }
    return link.replace(/^\/admin/, '')
  }

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      if (unreadCount === 0) return
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (e) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', e)
    }
  }

  return (
    <div className="relative group" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer text-[#800a0d] bg-white relative z-99 flex rounded-full border border-gray-200 p-2 hover:bg-gray-50 transition-all shadow-sm"
        title="Thông báo"
      >
        <Bell size={20} className="hover:text-red-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 py-2 mt-3 bg-white border border-gray-100 shadow-2xl z-99 w-80 sm:w-96 rounded-xl before:absolute before:-top-2 before:right-4 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-t before:border-l before:border-gray-100">
          <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 rounded-t-xl">
            <span className="flex items-center gap-2 font-bold text-gray-800">
              <Bell size={16} className="text-[#800a0d]" /> Thông báo admin
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#800a0d] font-medium hover:underline transition-all">
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-gray-200">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center p-8 text-sm text-center text-gray-400">
                <Bell size={32} className="mb-2 text-gray-200" />
                Chưa có thông báo nào.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-gray-50 flex flex-col gap-1.5 transition-colors cursor-pointer relative overflow-hidden group/notif ${n.isRead ? 'bg-white hover:bg-gray-50' : 'bg-red-50/40 hover:bg-red-50/80'}`}
                  onClick={() => {
                    if (!n.isRead) markAsRead(n._id)
                  }}
                >
                  {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#800a0d] rounded-r"></div>}
                  <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'} leading-snug`}>{n.message}</p>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(n.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    {n.link && (
                      <Link to={normalizeLink(n.link)} className="text-[11px] text-primary font-semibold hover:underline bg-red-50 px-2 py-0.5 rounded-full" onClick={() => setIsOpen(false)}>
                        Xem đơn
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
