import React, { useState, useEffect } from 'react'
import { Truck, Package, CheckCircle, RefreshCw, MapPin, Phone, Navigation, LayoutDashboard, History, User, Search, Bell, Wifi, Battery, Signal, Clock } from 'lucide-react'

function App() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('todo') // todo, returns, history
  const [statusFilter, setStatusFilter] = useState('all')
  const [amountFilter, setAmountFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/all`)
      const data = await res.json()
      if (data.success) {
        // Lấy tất cả các đơn hàng có trạng thái liên quan đến Shipper
        const relevantStatuses = ['READY_TO_PICK', 'PICKING', 'STORING', 'DELIVERING', 'RETURN_REQUESTED', 'RETURN_PICKING', 'RETURNED', 'COMPLETED', 'CANCELLED']
        const filtered = data.orders.filter((o) => relevantStatuses.includes(o.status))
        setOrders(filtered)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [activeTab])

  const handleUpdate = async (orderId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/shipper-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Cập nhật thành công!')
        fetchOrders()
      } else {
        alert(data.message || 'Lỗi cập nhật!')
      }
    } catch (e) {
      alert('Lỗi server!')
    }
  }

  // LOGIC LỌC ĐƠN HÀNG THEO TAB VÀ BỘ LỌC
  const filteredOrders = orders.filter((o) => {
    // 1. Lọc theo Tab chính
    if (activeTab === 'todo') {
      if (!['READY_TO_PICK', 'PICKING', 'STORING', 'DELIVERING'].includes(o.status)) return false
    } else if (activeTab === 'returns') {
      if (!['RETURN_REQUESTED', 'RETURN_PICKING'].includes(o.status)) return false
    } else if (activeTab === 'history') {
      if (!['COMPLETED', 'CANCELLED', 'RETURNED'].includes(o.status)) return false
    }

    // 2. Lọc theo dropdown status
    if (statusFilter !== 'all' && o.status !== statusFilter) return false

    // 3. Lọc theo giá
    if (amountFilter === 'gt100k' && !(o.totalPrice > 100000)) return false
    if (amountFilter === 'lt100k' && !(o.totalPrice <= 100000)) return false

    // 4. Tìm kiếm
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase()
      return o.customerInfo.fullName.toLowerCase().includes(q) || o.customerInfo.phone.includes(q) || (o.ghnOrderCode && o.ghnOrderCode.toLowerCase().includes(q))
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 py-10 font-sans">
      <div className="relative mx-auto border-[8px] border-[#333] rounded-[60px] h-[850px] w-[395px] bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* STATUS BAR */}
        <div className="absolute top-0 w-full h-12 flex justify-between items-center px-8 z-[100] text-white">
          <span className="text-sm font-bold">
            {currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <div className="flex items-center gap-1.5">
            <Signal size={14} />
            <Wifi size={14} />
            <Battery size={18} />
          </div>
        </div>

        <div className="h-full w-full bg-[#f4f4f4] overflow-y-auto pt-12 scrollbar-hide">
          <header className="bg-gradient-to-r from-[#f26522] to-[#9d0b0f] text-white p-5 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/20">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] opacity-70 font-black uppercase">Giao hàng nhanh</p>
                  <h2 className="text-sm font-black">Shipper Hệ Thống</h2>
                </div>
              </div>
              <button onClick={fetchOrders} className={loading ? 'animate-spin' : ''}>
                <RefreshCw size={22} />
              </button>
            </div>
          </header>

          {/* TAB SWITCHER - ĐÃ CẬP NHẬT 3 TAB */}
          <div className="flex gap-2 p-4">
            <button
              onClick={() => setActiveTab('todo')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${activeTab === 'todo' ? 'bg-[#f26522] text-white' : 'bg-white text-gray-400'}`}
            >
              Đang giao
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${activeTab === 'returns' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}
            >
              Hoàn trả
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${activeTab === 'history' ? 'bg-gray-800 text-white' : 'bg-white text-gray-400'}`}
            >
              Lịch sử
            </button>
          </div>

          {/* LIST ORDERS */}
          <div className="px-4 space-y-4 pb-28">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[32px] border border-dashed text-gray-400">
                <Package size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">Không có đơn hàng nào!</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50/50">
                    <span className="text-[10px] font-black text-[#f26522] uppercase">{order.ghnOrderCode || 'Đơn nội bộ'}</span>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md ${order.status.includes('RETURN') ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-[#f26522]">
                        <User size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{order.customerInfo.fullName}</h4>
                        <p className="text-xs font-bold text-blue-500">{order.customerInfo.phone}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs font-medium text-gray-500">
                      <MapPin size={16} className="text-red-500 shrink-0" />
                      <p className="line-clamp-2">{order.customerInfo.address}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-dashed">
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Tổng tiền</p>
                        <p className="text-lg font-black text-red-600">{((order.paymentMethod || '').toUpperCase() === 'VNPAY' ? 0 : Number(order.totalPrice || 0)).toLocaleString()}đ</p>
                      </div>

                      {/* NÚT BẤM THAY ĐỔI THEO TAB */}
                      {activeTab !== 'history' && (
                        <button
                          onClick={() => handleUpdate(order._id)}
                          className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg flex items-center gap-2 ${
                            order.status === 'RETURN_REQUESTED' ? 'bg-red-500' : order.status === 'RETURN_PICKING' ? 'bg-indigo-600' : 'bg-[#f26522]'
                          }`}
                        >
                          {order.status === 'READY_TO_PICK' && 'Lấy hàng ngay'}
                          {order.status === 'PICKING' && 'Nhập kho SOC'}
                          {order.status === 'STORING' && 'Xuất kho giao'}
                          {order.status === 'DELIVERING' && 'Giao thành công'}
                          {order.status === 'RETURN_REQUESTED' && 'Lấy hàng hoàn'}
                          {order.status === 'RETURN_PICKING' && 'Trả cho Shop'}
                          <Navigation size={14} fill="white" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* BOTTOM DOCK */}
          <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur-xl rounded-[30px] flex justify-around p-3 shadow-2xl border border-white/20 z-[100]">
            <button onClick={() => setActiveTab('todo')} className={`p-3 rounded-2xl ${activeTab === 'todo' ? 'bg-[#f26522] text-white shadow-lg' : 'text-gray-400'}`}>
              <LayoutDashboard size={22} />
            </button>
            <button onClick={() => setActiveTab('returns')} className={`p-3 rounded-2xl ${activeTab === 'returns' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>
              <Truck size={22} />
            </button>
            <button onClick={() => setActiveTab('history')} className={`p-3 rounded-2xl ${activeTab === 'history' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400'}`}>
              <History size={22} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default App
