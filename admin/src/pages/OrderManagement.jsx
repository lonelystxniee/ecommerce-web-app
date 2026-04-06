import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, Filter, RefreshCcw, Package, Trash2, X, User, MapPin, Truck, CheckCircle, Phone, Mail, CreditCard, ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react'

// ─── CUSTOM WORKFLOW DROPDOWN ───────────────────────────────────────────────
const STATUS_STYLE = {
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' },
  PACKING: { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-500' },
}

// action → trạng thái kết quả sau khi thực hiện
const ACTIONS = [
  { key: 'confirm', label: 'Xác nhận đơn', emoji: '✅', result: 'CONFIRMED', color: 'text-blue-600', hover: 'hover:bg-blue-50' },
  { key: 'pack', label: 'Đóng gói', emoji: '📦', result: 'PACKING', color: 'text-orange-600', hover: 'hover:bg-orange-50' },
  { key: 'handover', label: 'Bàn giao GHN', emoji: '🚚', result: 'READY_TO_PICK', color: 'text-green-600', hover: 'hover:bg-green-50' },
  { key: 'revert', label: 'Hủy xác nhận', emoji: '↩️', result: 'PENDING', color: 'text-yellow-600', hover: 'hover:bg-yellow-50', separator: true },
  { key: 'cancel', label: 'Hủy đơn', emoji: '❌', result: 'CANCELLED', color: 'text-red-500', hover: 'hover:bg-red-50', separator: true },
]

const WorkflowDropdown = ({ order, statusMap, onAction }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const style = STATUS_STYLE[order.status] || { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' }

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
          open ? 'ring-2 ring-offset-1 ring-[#9d0b0f]/30 border-[#9d0b0f]/40' : 'border-transparent'
        } ${style.bg} ${style.text} hover:shadow-md`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
        {statusMap[order.status] || order.status}
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 left-0 min-w-[180px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
          <div className="px-3 py-2 border-b border-gray-50">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Chuyển trạng thái</p>
          </div>
          {ACTIONS.map((a) => {
            const isCurrent = order.status === a.result
            return (
              <div key={a.key}>
                {a.separator && <div className="h-px mx-3 my-1 bg-gray-100" />}
                <button
                  onClick={() => {
                    if (!isCurrent) {
                      onAction(order._id, a.key)
                      setOpen(false)
                    }
                  }}
                  disabled={isCurrent}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold transition-all
                    ${isCurrent ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : `${a.color} ${a.hover} cursor-pointer`}`}
                >
                  <span className="text-sm">{a.emoji}</span>
                  <span className="flex-1 text-left">{a.label}</span>
                  {isCurrent && <span className="text-[8px] bg-gray-200 text-gray-400 px-1.5 py-0.5 rounded-full font-black">HIỆN TẠI</span>}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
// ────────────────────────────────────────────────────────────────────────────

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [workflowLoading, setWorkflowLoading] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'ALL',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    productName: '',
  })

  // Thêm state cho bộ lọc nhanh (Quick Filters)
  const [itemSearch, setItemSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const navigate = useNavigate()

  const STATUS_MAP = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    PACKING: 'Đang đóng gói',
    READY_TO_PICK: 'Chờ vận chuyển',
    PICKING: 'Đang lấy hàng',
    STORING: 'Đã vào kho',
    DELIVERING: 'Đang giao hàng',
    COMPLETED: 'Hoàn tất',
    CANCELLED: 'Đã hủy',
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175'

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const queryParams = new URLSearchParams()
      if (filters.status && filters.status !== 'ALL') queryParams.append('status', filters.status)
      if (filters.minAmount) queryParams.append('minAmount', filters.minAmount)
      if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount)
      if (filters.productName) queryParams.append('productName', filters.productName)
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)

      const response = await fetch(`${API_URL}/api/orders/all?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) setOrders(data.orders)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [filters.status, filters.startDate, filters.endDate]) // Auto fetch on these changes

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleResetFilters = () => {
    setFilters({
      status: 'ALL',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
      productName: '',
    })
    setSearchTerm('')
    setItemSearch('')
    setMinPrice('')
    setMaxPrice('')
    setStatusFilter('ALL')
    fetchOrders()
  }

  const resetFilters = handleResetFilters

  const activeFilterCount = Object.values(filters).filter((v) => v !== '' && v !== 'ALL').length

  // HÀM XỬ LÝ QUY TRÌNH (WORKFLOW)
  const handleWorkflow = async (orderId, action) => {
    const actionMessages = {
      confirm: 'Bạn có chắc chắn muốn XÁC NHẬN đơn hàng này?',
      pack: 'Chuyển đơn hàng sang trạng thái ĐANG ĐÓNG GÓI?',
      handover: 'Xác nhận BÀN GIAO đơn hàng cho đơn vị vận chuyển GHN?',
      cancel: 'Bạn có chắc chắn muốn HỦY đơn hàng này?',
      revert: 'Bạn có chắc chắn muốn hủy xác nhận (trở về trạng thái chờ)?',
    }

    if (!window.confirm(actionMessages[action] || 'Xác nhận thực hiện hành động này?')) return

    setWorkflowLoading(orderId)
    try {
      const token = localStorage.getItem('token')
      let response
      let data
      if (action === 'revert') {
        // Use the generic status update endpoint to set back to PENDING
        response = await fetch(`${API_URL}/api/orders/status/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'PENDING' }),
        })
        data = await response.json()
      } else {
        response = await fetch(`${API_URL}/api/orders/${action}/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        data = await response.json()
      }

      if (data.success) {
        fetchOrders()
        setIsModalOpen(false)
      } else {
        alert('Lỗi: ' + (data.message || 'Không rõ nguyên nhân'))
      }
    } catch (error) {
      alert('Lỗi kết nối: ' + error.message)
    } finally {
      setWorkflowLoading(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm || order._id.toLowerCase().includes(searchTerm.toLowerCase()) || (order.customerInfo && order.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesItemSearch = !itemSearch || (order.items || []).some((it) => it.name.toLowerCase().includes(itemSearch.toLowerCase()))

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter

    const amount = Number(order.totalPrice || 0)
    const matchesMinPrice = !minPrice || amount >= Number(minPrice)
    const matchesMaxPrice = !maxPrice || amount <= Number(maxPrice)

    return matchesSearch && matchesItemSearch && matchesStatus && matchesMinPrice && matchesMaxPrice
  })

  const totalItems = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages])

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  const getVisiblePages = () => {
    const maxVisible = 5
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1)
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, currentPage + 2)
    if (currentPage <= 2) {
      start = 1
      end = maxVisible
    } else if (currentPage >= totalPages - 1) {
      start = totalPages - (maxVisible - 1)
      end = totalPages
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-gray-100 text-gray-500',
      CONFIRMED: 'bg-blue-100 text-blue-600',
      PACKING: 'bg-orange-100 text-orange-600',
      READY_TO_PICK: 'bg-indigo-100 text-indigo-600',
      PICKING: 'bg-purple-100 text-purple-600',
      STORING: 'bg-amber-100 text-amber-600',
      DELIVERING: 'bg-blue-600 text-white',
      COMPLETED: 'bg-green-100 text-green-600',
      CANCELLED: 'bg-red-100 text-red-600',
    }
    return styles[status] || 'bg-gray-100 text-gray-500'
  }

  const subtotalForSelected = selectedOrder ? (selectedOrder.items || []).reduce((s, it) => s + (Number(it.price || 0) || 0) * (Number(it.quantity || 1) || 0), 0) : 0
  const shippingFeeForSelected = selectedOrder && selectedOrder.shipping ? Number(selectedOrder.shipping.shippingFee || 0) : 0
  const discountForSelected = selectedOrder ? Number(selectedOrder.discountAmount || 0) : 0
  const computedTotalForSelected = selectedOrder ? Number(selectedOrder.totalPrice || subtotalForSelected + shippingFeeForSelected - discountForSelected) : 0

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b-2 border-[#9d0b0f] pb-6">
        <div>
          <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">Quản lý vận đơn</h2>
          <p className="text-[#88694f] font-medium italic">Quy trình: Xác nhận → Đóng gói → Bàn giao GHN</p>
        </div>
        <button onClick={fetchOrders} className="p-3 bg-white border border-[#9d0b0f]/20 rounded-2xl text-[#9d0b0f]">
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white/90 p-6 rounded-[32px] shadow-sm border border-[#9d0b0f]/10 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Tìm kiếm cơ bản */}
          <div className="relative">
            <Search className="absolute left-4 top-3 text-[#9d0b0f]" size={16} />
            <input
              type="text"
              placeholder="Tên khách / Mã đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f7f4ef]/50 border border-transparent focus:border-[#9d0b0f]/30 rounded-xl outline-none text-sm transition-all"
            />
          </div>

          {/* Tìm theo sản phẩm */}
          <div className="relative">
            <Package className="absolute left-4 top-3 text-[#9d0b0f]" size={16} />
            <input
              type="text"
              placeholder="Tên sản phẩm trong đơn..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f7f4ef]/50 border border-transparent focus:border-[#9d0b0f]/30 rounded-xl outline-none text-sm transition-all"
            />
          </div>

          {/* Lọc theo giá */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Giá từ..."
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 px-4 py-2 bg-[#f7f4ef]/50 border border-transparent focus:border-[#9d0b0f]/30 rounded-xl outline-none text-sm transition-all"
            />
            <input
              type="number"
              placeholder="đến..."
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 px-4 py-2 bg-[#f7f4ef]/50 border border-transparent focus:border-[#9d0b0f]/30 rounded-xl outline-none text-sm transition-all"
            />
          </div>

          {/* Lọc theo trạng thái */}
          <div className="relative">
            <Filter className="absolute left-4 top-3 text-[#9d0b0f]" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f7f4ef]/50 border border-transparent focus:border-[#9d0b0f]/30 rounded-xl outline-none text-sm transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(STATUS_MAP).map(([key, val]) => (
                <option key={key} value={key}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nút thao tác bổ sung */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 border-dashed">
          {(searchTerm || itemSearch || minPrice || maxPrice || statusFilter !== 'ALL') && (
            <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-[#9d0b0f] transition-colors">
              <Trash2 size={14} /> Xóa bộ lọc
            </button>
          )}
          <div className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-3 rounded-lg">
            Hiển thị: {filteredOrders.length} / {orders.length} đơn hàng
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <RefreshCcw size={40} className="text-[#9d0b0f] animate-spin" />
            <p className="text-[#88694f] font-bold italic animate-pulse">Đang tải danh sách vận đơn...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400">
            <Package size={60} strokeWidth={1} />
            <p className="italic font-bold">Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</p>
            <button onClick={handleResetFilters} className="text-[#9d0b0f] underline text-sm font-bold">
              Xóa bộ lọc và thử lại
            </button>
          </div>
        ) : (
          <table className="w-full text-sm text-left min-w-[1000px]">
            <thead className="bg-[#9d0b0f] text-white text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-8 py-5">Mã đơn</th>
                <th className="px-8 py-5">Khách hàng</th>
                <th className="px-8 py-5 text-center">Xử lý nội bộ (Shop)</th>
                <th className="px-8 py-5 text-center">Trạng thái vận chuyển</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.map((order) => (
                <tr key={order._id} className="hover:bg-[#f7f4ef]/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-[#9d0b0f]">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-[#3e2714]">{order.customerInfo.fullName}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{order.customerInfo.phone}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center">
                      {workflowLoading === order._id ? (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 animate-pulse">
                          <RefreshCcw size={12} className="animate-spin" /> ĐANG XỬ LÝ...
                        </div>
                      ) : ['READY_TO_PICK', 'PICKING', 'STORING', 'DELIVERING', 'COMPLETED'].includes(order.status) ? (
                        <span className="text-green-600 font-black text-[10px] flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                          <CheckCircle size={12} /> Đã bàn giao
                        </span>
                      ) : order.status === 'CANCELLED' ? (
                        <span className="text-red-500 font-black text-[10px] bg-red-50 px-3 py-1.5 rounded-full border border-red-100">Đã hủy</span>
                      ) : (
                        <WorkflowDropdown order={order} statusMap={STATUS_MAP} onAction={handleWorkflow} />
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${getStatusBadge(order.status)}`}>{STATUS_MAP[order.status] || order.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setIsModalOpen(true)
                      }}
                      className="text-blue-500 p-2.5 bg-blue-50 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && orders.length > 0 && (
        <div className="flex flex-col items-center gap-4 pt-6 mt-6 border-t border-gray-200 border-dashed">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded text-gray-500 hover:text-gray-900 ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              {getVisiblePages().map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 text-sm font-bold ${p === currentPage ? 'bg-[#9d0b0f] text-white shadow-md rounded-md' : 'text-gray-700'}`}>
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1 rounded text-gray-500 hover:text-gray-900 ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#f7f4ef] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl border-2 border-[#9d0b0f] animate-zoomIn">
            <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center sticky top-0 z-20">
              <div>
                <h3 className="text-xl font-bold tracking-tight uppercase">Chi tiết đơn hàng</h3>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Mã đơn: {selectedOrder._id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full bg-white/20 hover:bg-white/40">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-1">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-200">
                  <h4 className="text-[#9d0b0f] font-black uppercase text-xs mb-4 flex items-center gap-2 border-b pb-2">
                    <User size={14} /> Thông tin khách nhận
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <User size={16} className="text-[#f39200] shrink-0" />
                      <span className="font-bold text-[#3e2714]">{selectedOrder.customerInfo.fullName}</span>
                    </div>
                    <div className="flex gap-3">
                      <Phone size={16} className="text-[#f39200] shrink-0" />
                      <span className="font-medium">{selectedOrder.customerInfo.phone}</span>
                    </div>
                    {selectedOrder.customerInfo.email && (
                      <div className="flex gap-3">
                        <Mail size={16} className="text-[#f39200] shrink-0" />
                        <span className="text-gray-500 break-all">{selectedOrder.customerInfo.email}</span>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <MapPin size={16} className="text-[#f39200] shrink-0" />
                      <span className="italic leading-relaxed text-gray-600">{selectedOrder.customerInfo.address}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-200">
                  <h4 className="text-[#9d0b0f] font-black uppercase text-xs mb-4 flex items-center gap-2 border-b pb-2">
                    <CreditCard size={14} /> Thanh toán & Ghi chú
                  </h4>
                  <div className="space-y-3 text-xs">
                    <p className="font-bold">
                      Phương thức: <span className="text-[#f39200]">{selectedOrder.paymentMethod}</span>
                    </p>
                    <p className="flex items-center gap-1 font-bold">
                      <Calendar size={12} /> Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                    </p>
                    <div className="p-3 mt-2 border border-orange-200 border-dashed bg-orange-50 rounded-xl">
                      <p className="text-[10px] font-bold text-[#88694f] uppercase mb-1">Ghi chú của khách:</p>
                      <p className="italic text-[#3e2714]">{selectedOrder.customerInfo.note || 'Không có ghi chú'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f7f4ef] border-b">
                      <tr className="text-[10px] font-black uppercase text-gray-400">
                        <th className="py-4 text-center">Sản phẩm</th>
                        <th className="py-4 text-center">Giá</th>
                        <th className="py-4 text-center">SL</th>
                        <th className="py-4 pr-6 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="flex items-center gap-3 py-4 pl-6">
                            <img src={item.image || (item.images && item.images[0])} className="w-12 h-12 rounded-lg object-contain bg-[#f7f4ef]" alt="" />
                            <div>
                              <p className="font-bold text-[#3e2714] line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium italic">{item.label || 'Mặc định'}</p>
                            </div>
                          </td>
                          <td className="py-4 font-medium text-center">{item.price.toLocaleString()}đ</td>
                          <td className="py-4 font-black text-center">x{item.quantity}</td>
                          <td className="py-4 pr-6 text-right font-black text-[#9d0b0f]">{(item.price * item.quantity).toLocaleString()}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 bg-white border-t">
                    <div className="flex justify-between mb-2 text-sm text-gray-600">
                      <span>Phí vận chuyển:</span>
                      <span>{(shippingFeeForSelected || 0).toLocaleString()}đ</span>
                    </div>
                    {discountForSelected > 0 && (
                      <div className="flex justify-between mb-2 text-sm text-green-600">
                        <span>Giảm giá:</span>
                        <span>-{discountForSelected.toLocaleString()}đ</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Package size={20} />
                      <span className="text-xs font-bold tracking-widest uppercase">Tổng cộng thanh toán</span>
                    </div>
                    <span className="text-2xl font-black">{computedTotalForSelected.toLocaleString()}đ</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex flex-col mb-4 bg-white p-4 rounded-2xl border border-dashed border-[#9d0b0f]/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] font-black uppercase text-gray-400">Mã GHN (Giao hàng nhanh)</div>
                      <div className="text-sm font-black text-[#f39200]">{selectedOrder.ghnOrderCode || selectedOrder.shipping?.ghnOrderCode || 'CHƯA CẬP NHẬT'}</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    {!selectedOrder.ghnOrderCode && !selectedOrder.shipping?.ghnOrderCode && selectedOrder.status !== 'CANCELLED' && (
                      <button
                        onClick={async () => {
                          if (!confirm('Tạo đơn giao hàng trên hệ thống GHN?')) return
                          try {
                            const token = localStorage.getItem('token')
                            const res = await fetch(`${API_URL}/api/admin/orders/${selectedOrder._id}/ship`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` },
                            })
                            const d = await res.json()
                            if (d.success) {
                              fetchOrders()
                              setIsModalOpen(false)
                            } else {
                              alert('Lỗi: ' + (d.message || 'Không thể tạo đơn GHN'))
                            }
                          } catch (e) {
                            alert('Lỗi kết nối', e.message)
                          }
                        }}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-green-700 transition-all flex items-center gap-2"
                      >
                        <Truck size={14} /> Tạo đơn GHN
                      </button>
                    )}
                    {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                      <button
                        onClick={async () => {
                          if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
                          try {
                            const token = localStorage.getItem('token')
                            const res = await fetch(`${API_URL}/api/admin/orders/${selectedOrder._id}/cancel`, {
                              method: 'PUT',
                              headers: { Authorization: `Bearer ${token}` },
                            })
                            const d = await res.json()
                            if (d.success) {
                              alert(d.message || 'Đã hủy đơn thành công')
                              fetchOrders()
                              setIsModalOpen(false)
                            } else {
                              alert('Lỗi: ' + (d.message || 'Không thể hủy đơn'))
                            }
                          } catch (e) {
                            alert('Lỗi kết nối', e.message)
                          }
                        }}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-700 transition-all flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Hủy đơn này
                      </button>
                    )}
                    {selectedOrder.status === 'READY_TO_RETURN' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm('Bàn đã nhận lại hàng và muốn hoàn lại tiền cho khách?')) return
                          try {
                            const token = localStorage.getItem('token')
                            const res = await fetch(`${API_URL}/api/admin/orders/${selectedOrder._id}/confirm-returned`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            })
                            const data = await res.json()
                            if (data.success) {
                              alert('Thành công! Tiền đã được cộng vào ví khách.')
                              fetchOrders()
                              setIsModalOpen(false)
                            } else {
                              alert('Lỗi: ' + data.message)
                            }
                          } catch (e) {
                            alert('Lỗi kết nối')
                          }
                        }}
                        className="bg-red-600 hover:bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg animate-pulse"
                      >
                        <RefreshCcw size={14} /> NHẬN HÀNG HOÀN & HOÀN TIỀN VÍ
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsModalOpen(false)
                        navigate(`/orders/order-tracking/${selectedOrder._id}`)
                      }}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <Eye size={14} /> Xem hành trình
                    </button>
                  </div>
                </div>
                <div className="flex justify-end pt-4 mt-8 border-t">
                  <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-xs font-bold transition-all rounded-2xl bg-stone-100 text-stone-500 hover:bg-stone-200">
                    ĐÓNG CỬA SỔ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement
