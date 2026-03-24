import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { getSocket } from '../utils/socket'
import API_URL from '../config/apiConfig'

const NotificationDropdown = ({ user }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Fetch từ backend
  useEffect(() => {
    if (!user) return
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token')
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
  }, [user])

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Socket
  useEffect(() => {
    const socket = getSocket()

    const handleNewOrderObj = (data) => {
      try {
        const uStr = localStorage.getItem('user')
        const u = uStr ? JSON.parse(uStr) : null
        if (u && u.role === 'ADMIN') {
          setNotifications((prev) => [data, ...prev].slice(0, 50))
          setUnreadCount((prev) => prev + 1)
        }
      } catch (err) {
        console.error(err)
      }
    }

    const handleOrderStatusObj = (data) => {
      try {
        const uStr = localStorage.getItem('user')
        const u = uStr ? JSON.parse(uStr) : null
        if (u && String(u._id) === String(data.userId)) {
          setNotifications((prev) => [data, ...prev].slice(0, 50))
          setUnreadCount((prev) => prev + 1)
        }
      } catch (err) {
        console.error(err)
      }
    }

    socket.on('new_order', handleNewOrderObj)
    socket.on('order_status_updated', handleOrderStatusObj)

    return () => {
      socket.off('new_order', handleNewOrderObj)
      socket.off('order_status_updated', handleOrderStatusObj)
    }
  }, [])

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.log(err)
    }
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
    } catch (err) {
      console.log(err)
    }
  }

  if (!user) return null

  return (
    <div className="relative group" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer text-primary relative border-secondary flex rounded-full border-2 p-1.5 hover:bg-secondary transition-all" title="Thông báo">
        <Bell size={20} className="hover:text-white group-hover:text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 py-2 mt-3 bg-white border border-gray-100 shadow-2xl w-80 sm:w-96 rounded-xl z-100 before:absolute before:-top-2 before:right-3 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-t before:border-l before:border-gray-100">
          <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 rounded-t-xl">
            <span className="flex items-center gap-2 font-bold text-gray-800">
              <Bell size={16} className="text-secondary" /> Thông báo
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium transition-all text-primary hover:underline">
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
                  {!n.isRead && <div className="absolute top-0 bottom-0 left-0 w-1 rounded-r bg-secondary"></div>}
                  <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'} leading-snug`}>{n.message}</p>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(n.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    {n.link && (
                      <Link to={n.link} className="text-[11px] text-primary font-semibold hover:underline bg-red-50 px-2 py-0.5 rounded-full" onClick={() => setIsOpen(false)}>
                        Xem chi tiết
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
