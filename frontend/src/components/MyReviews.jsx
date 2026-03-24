import React, { useState, useEffect, useMemo } from 'react'
import { Star, MessageSquare, Package, Clock, Edit, Trash2, Search, X, Filter, ArrowUpDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const MyReviews = () => {
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'reviewed'
  const [pendingReviews, setPendingReviews] = useState([])
  const [reviewedItems, setReviewedItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter / Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('newest') // 'newest' | 'oldest'
  const [ratingFilter, setRatingFilter] = useState('all') // 'all' | '5' | '4' | '3' | '2' | '1'

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const endpoint = activeTab === 'pending' ? '/api/reviews/pending' : '/api/reviews/my-reviews'
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        if (activeTab === 'pending') {
          setPendingReviews(data.pendingReviews || [])
        } else {
          setReviewedItems(data.reviews || [])
        }
      }
    } catch (error) {
      console.log(error)
      toast.error('Không thể tải dữ liệu đánh giá')
    } finally {
      setLoading(false)
    }
  }

  // Filter Logic
  const filteredPending = useMemo(() => {
    let result = [...pendingReviews]

    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(lowerSearch) || (item.orderId && item.orderId.toLowerCase().includes(lowerSearch)))
    }

    // Sort by order date
    result.sort((a, b) => {
      const dateA = new Date(a.orderDate || 0).getTime()
      const dateB = new Date(b.orderDate || 0).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [pendingReviews, searchTerm, sortOrder])

  const filteredReviewed = useMemo(() => {
    let result = [...reviewedItems]

    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      result = result.filter((review) => (review.productID?.productName || '').toLowerCase().includes(lowerSearch) || (review.comment || '').toLowerCase().includes(lowerSearch))
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      result = result.filter((review) => review.rating === Number(ratingFilter))
    }

    // Sort by review created date
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [reviewedItems, searchTerm, sortOrder, ratingFilter])

  // Action Handlers
  const openReviewModal = (product) => {
    setIsEditing(false)
    setSelectedProduct(product)
    setRating(5)
    setComment('')
    setIsModalOpen(true)
  }

  const openEditModal = (review) => {
    setIsEditing(true)
    setSelectedProduct({
      productID: review.productID?._id,
      name: review.productID?.productName,
      image: review.productID?.images?.[0],
    })
    setRating(review.rating)
    setComment(review.comment)
    setIsModalOpen(true)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Đã xóa đánh giá thành công!')
        fetchData()
      } else {
        toast.error(data.message || 'Không thể xóa đánh giá')
      }
    } catch (error) {
      console.error('Delete review error:', error)
      toast.error('Hệ thống gián đoạn, vui lòng thử lại sau!')
    }
  }

  const submitReview = async () => {
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      // Both Create and Edit use the exact same POST endpoint (Upsert logic in backend)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productID: selectedProduct.productID,
          rating,
          comment,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(isEditing ? 'Cập nhật đánh giá thành công!' : 'Gửi đánh giá thành công!')
        setIsModalOpen(false)
        fetchData() // Refresh list automatically based on active tab
        // Optionally shift user to 'reviewed' tab upon successful review
        if (!isEditing && activeTab === 'pending') {
          setActiveTab('reviewed')
        }
      } else {
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Submit review error:', error)
      toast.error('Không thể gửi đánh giá')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-[32px] p-6 lg:p-8 space-y-6 animate-zoomIn">
      <h2 className="text-2xl font-black text-[#800a0d] tracking-tighter uppercase mb-2">Đánh giá của tôi</h2>

      {/* Toolbar: Tabs & Search Filter */}
      <div className="flex flex-col items-start justify-between gap-6 pb-2 mb-8 xl:flex-row xl:items-center">
        {/* Toggle Pills */}
        <div className="flex bg-gray-100/80 p-1.5 rounded-full shadow-inner w-full md:w-auto overflow-x-auto pb-2 whitespace-nowrap [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-red-400">
          <button
            onClick={() => {
              setActiveTab('pending')
              setSearchTerm('')
              setRatingFilter('all')
              setSortOrder('newest')
            }}
            className={`flex-1 md:flex-none px-4 md:px-8 py-3 font-bold text-[11px] md:text-[13px] uppercase tracking-widest transition-all duration-300 rounded-full shrink-0 ${
              activeTab === 'pending' ? 'bg-gradient-to-r from-red-800 to-red-600 text-white shadow-[0_4px_15px_-3px_rgba(128,10,13,0.4)]' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            Chưa đánh giá <span className="ml-1 opacity-80 text-[10px] md:text-xs">({pendingReviews.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('reviewed')
              setSearchTerm('')
              setRatingFilter('all')
              setSortOrder('newest')
            }}
            className={`flex-1 md:flex-none px-4 md:px-8 py-3 font-bold text-[11px] md:text-[13px] uppercase tracking-widest transition-all duration-300 rounded-full shrink-0 ${
              activeTab === 'reviewed' ? 'bg-gradient-to-r from-red-800 to-red-600 text-white shadow-[0_4px_15px_-3px_rgba(128,10,13,0.4)]' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            Đã đánh giá <span className="ml-1 opacity-80 text-[10px] md:text-xs">({reviewedItems.length})</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center w-full gap-3 pb-4 xl:w-auto xl:pb-0">
          {/* Rating Filter (Only in reviewed tab) */}
          {activeTab === 'reviewed' && (
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-2.5 hover:border-red-200 hover:shadow-sm focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all min-w-[140px]">
              <Filter size={16} className="mr-2 text-gray-400 shrink-0" />
              <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="bg-transparent text-sm font-bold text-[#3e2714] outline-none cursor-pointer w-full">
                <option value="all">Tất cả sao</option>
                <option value="5">5 Sao (Tuyệt vời)</option>
                <option value="4">4 Sao (Tốt)</option>
                <option value="3">3 Sao (Bình thường)</option>
                <option value="2">2 Sao (Tệ)</option>
                <option value="1">1 Sao (Rất tệ)</option>
              </select>
            </div>
          )}

          {/* Sort Order */}
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-2.5 hover:border-red-200 hover:shadow-sm focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all min-w-[140px]">
            <ArrowUpDown size={16} className="mr-2 text-gray-400 shrink-0" />
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-transparent text-sm font-bold text-[#3e2714] outline-none cursor-pointer w-full">
              <option value="newest">Ngày gửi: Mới nhất</option>
              <option value="oldest">Ngày gửi: Cũ nhất</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 w-full md:w-72">
            <div className="bg-white border border-gray-200 rounded-2xl flex items-center px-4 py-2.5 hover:border-red-200 hover:shadow-sm focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
              <Search size={16} className="mr-2 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={activeTab === 'pending' ? 'Tìm tên món ăn, mã đơn...' : 'Tìm tên món, nhận xét...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm w-full outline-none font-bold text-[#3e2714] placeholder:font-normal placeholder:text-gray-400"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1 ml-1 text-gray-400 transition-colors bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 shrink-0">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="animate-pulse text-[#88694f] font-bold">Đang tải...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* TAB = PENDING */}
          {activeTab === 'pending' && filteredPending.length === 0 && (
            <div className="py-20 text-center border border-gray-200 border-dashed bg-gray-50 rounded-3xl">
              <MessageSquare className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="font-bold text-gray-500">{searchTerm ? 'Không tìm thấy sản phẩm nào' : 'Không có sản phẩm nào cần đánh giá'}</p>
            </div>
          )}

          {activeTab === 'pending' &&
            filteredPending.map((item, idx) => (
              <div
                key={idx}
                className="group flex flex-col lg:flex-row items-center gap-6 p-5 transition-all duration-300 border border-gray-100 bg-white hover:bg-[#fffbf5] rounded-[24px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-red-100"
              >
                <div className="relative overflow-hidden shrink-0 rounded-[18px] bg-slate-50 border border-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                  <img src={item.image} alt={item.name} className="object-cover w-24 h-24 transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-100"></div>
                </div>
                <div className="flex-1 w-full text-center md:text-left">
                  <Link to={`/product/${item.productID}`} className="font-black text-lg text-[#3e2714] hover:text-[#800a0d] line-clamp-2 leading-tight transition-colors">
                    {item.name}
                  </Link>
                  <div className="flex flex-col gap-2 mt-2 md:flex-row md:items-center md:gap-4">
                    <p className="flex justify-center items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide md:justify-start">
                      <Package size={14} /> Đơn: <span className="text-[#88694f]">#{item.orderId?.slice(-8).toUpperCase()}</span>
                    </p>
                    <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                    <p className="text-[#800a0d] font-black text-base">{item.price?.toLocaleString()}đ</p>
                  </div>
                </div>
                <div className="w-full mt-2 md:w-auto md:mt-0 shrink-0">
                  <button
                    onClick={() => openReviewModal(item)}
                    className="w-full md:w-auto bg-gradient-to-r from-red-800 to-red-600 text-white px-8 py-3.5 rounded-[16px] font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(128,10,13,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(128,10,13,0.5)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} /> Đánh giá ngay
                  </button>
                </div>
              </div>
            ))}

          {/* TAB = REVIEWED */}
          {activeTab === 'reviewed' && filteredReviewed.length === 0 && (
            <div className="py-20 text-center border border-gray-200 border-dashed bg-gray-50 rounded-3xl">
              <Star className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="font-bold text-gray-500">{searchTerm ? 'Không tìm thấy đánh giá nào' : 'Bạn chưa có đánh giá nào'}</p>
            </div>
          )}

          {activeTab === 'reviewed' &&
            filteredReviewed.map((review, idx) => (
              <div
                key={idx}
                className="p-6 border border-gray-100 rounded-[28px] space-y-5 bg-white shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Background decorative blob on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 transition-opacity rounded-full opacity-0 pointer-events-none bg-red-50/50 blur-3xl group-hover:opacity-100"></div>

                <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="flex items-start gap-4">
                    <div className="relative overflow-hidden transition-all border shadow-sm rounded-2xl bg-slate-50 border-slate-100 shrink-0 group-hover:shadow-md">
                      <img src={review.productID?.images?.[0]} alt={review.productID?.productName} className="object-cover w-16 h-16 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col justify-center min-h-[4rem]">
                      <Link to={`/product/${review.productID?._id}`} className="font-black text-base text-[#3e2714] hover:text-[#800a0d] line-clamp-2 transition-colors">
                        {review.productID?.productName}
                      </Link>
                      <div className="flex gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < review.rating ? 'currentColor' : 'none'}
                            strokeWidth={i < review.rating ? 0 : 2}
                            className={`${i < review.rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'} transition-all`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between w-full gap-3 pt-4 border-t border-gray-100 md:flex-col md:items-end md:justify-start md:w-auto md:border-none md:pt-0">
                    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-bold text-gray-400">
                      <Clock size={14} /> {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    {/* Action buttons appear on hover (md and above) and always on small screens */}
                    <div className="flex gap-2 transition-all duration-300 opacity-100 md:opacity-0 md:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                      <button
                        title="Sửa đánh giá"
                        onClick={() => openEditModal(review)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 text-blue-700 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm transition-all"
                      >
                        <Edit size={14} /> <span className="text-xs font-bold md:hidden">Sửa</span>
                      </button>
                      <button
                        title="Xóa đánh giá"
                        onClick={() => handleDeleteReview(review._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50/80 text-red-700 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm transition-all"
                      >
                        <Trash2 size={14} /> <span className="text-xs font-bold md:hidden">Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  {/* Chat Bubble Tail */}
                  <div className="absolute z-0 w-4 h-4 transform rotate-45 border-t border-l border-gray-100 -top-3 left-6 bg-gray-50/80"></div>
                  <p className="relative z-10 p-5 mt-2 text-[15px] font-medium leading-relaxed italic text-gray-700 bg-gray-50/80 backdrop-blur-sm border border-gray-100 shadow-inner rounded-2xl rounded-tl-none border-l-4 border-l-yellow-400/80">
                    "{review.comment}"
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(128,10,13,0.3)] relative animate-zoomIn overflow-hidden border border-gray-100">
            {/* Top decorative glow */}
            <div className="absolute top-0 w-64 h-32 -translate-x-1/2 rounded-full pointer-events-none left-1/2 bg-red-600/10 blur-3xl"></div>

            <button onClick={() => setIsModalOpen(false)} className="absolute p-2.5 text-gray-400 transition-all bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-full top-6 right-6 shadow-sm">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-black text-[#800a0d] mb-6 text-center tracking-tighter uppercase relative z-10">{isEditing ? 'Sửa đánh giá' : 'Đánh giá món ăn'}</h3>

            <div className="flex items-center gap-5 bg-gradient-to-r from-[#fdfaf5] to-white p-5 rounded-2xl mb-8 border border-gray-100 shadow-inner relative z-10">
              <div className="relative">
                <img src={selectedProduct?.image} alt={selectedProduct?.name} className="object-cover w-20 h-20 bg-white shadow-md border border-gray-50 rounded-[18px]" />
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white rounded-full p-1.5 shadow-md border-2 border-white">
                  <Star size={12} fill="currentColor" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#88694f] mb-1">Sản phẩm</p>
                <p className="font-black text-base text-[#3e2714] line-clamp-2 leading-tight">{selectedProduct?.name}</p>
              </div>
            </div>

            <div className="relative z-10 mb-8">
              <p className="mb-4 text-sm font-bold tracking-wide text-center text-gray-500">Bạn cảm thấy sản phẩm này thế nào?</p>
              <div className="flex justify-center gap-2 md:gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="relative group focus:outline-none">
                    <Star
                      size={44}
                      fill={rating >= star ? 'currentColor' : 'none'}
                      strokeWidth={rating >= star ? 0 : 1.5}
                      className={`transition-all duration-300 ${
                        rating >= star ? 'text-yellow-400 scale-110 drop-shadow-[0_2px_10px_rgba(250,204,21,0.5)]' : 'text-gray-200 group-hover:scale-110 group-hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="h-5 mt-3 text-sm font-black text-center text-yellow-500 transition-all">
                {rating === 5 && 'Tuyệt vời quá! 😍'}
                {rating === 4 && 'Rất ngon! 😊'}
                {rating === 3 && 'Cũng tạm được 😐'}
                {rating === 2 && 'Không ngon lắm 😕'}
                {rating === 1 && 'Quá tệ! 😞'}
              </p>
            </div>

            <div className="relative z-10 mb-8">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy chia sẻ cảm nhận chân thật của bạn về hương vị, bao bì..."
                className="w-full h-36 p-5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl resize-none focus:outline-none focus:bg-white focus:border-red-200 focus:ring-4 focus:ring-red-100/50 transition-all font-medium text-[15px] text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

            <button
              onClick={submitReview}
              disabled={submitting}
              className="relative z-10 w-full bg-gradient-to-r w-full from-red-800 to-red-600 text-white py-4.5 rounded-[20px] font-black shadow-[0_4px_20px_-5px_rgba(128,10,13,0.5)] hover:shadow-[0_8px_25px_-5px_rgba(128,10,13,0.6)] hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center uppercase tracking-widest text-[13px]"
            >
              {submitting ? 'Xin chờ một lát...' : isEditing ? 'Lưu thay đổi đánh giá' : 'Gửi lời đánh giá'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyReviews
