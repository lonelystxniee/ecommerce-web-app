import React, { useState, useEffect, useMemo } from 'react'
import {
  Star,
  MessageSquare,
  Package,
  Clock,
  Edit,
  Trash2,
  Search,
  X,
  Filter,
  ArrowUpDown,
} from 'lucide-react'
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
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          (item.orderId && item.orderId.toLowerCase().includes(lowerSearch)),
      )
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
      result = result.filter(
        (review) =>
          (review.productID?.productName || '').toLowerCase().includes(lowerSearch) ||
          (review.comment || '').toLowerCase().includes(lowerSearch),
      )
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
      <h2 className="text-2xl font-black text-[#800a0d] tracking-tighter uppercase mb-2">
        Đánh giá của tôi
      </h2>

      {/* Toolbar: Tabs & Search Filter */}
      <div className="flex flex-col items-start justify-between gap-4 pb-2 mb-6 border-b border-gray-100 xl:flex-row xl:items-center">
        <div className="flex">
          <button
            onClick={() => {
              setActiveTab('pending')
              setSearchTerm('')
              setRatingFilter('all')
              setSortOrder('newest')
            }}
            className={`pb-4 px-6 font-bold text-sm transition-all ${
              activeTab === 'pending'
                ? 'text-[#800a0d] border-b-2 border-[#800a0d]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Chưa đánh giá ({pendingReviews.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('reviewed')
              setSearchTerm('')
              setRatingFilter('all')
              setSortOrder('newest')
            }}
            className={`pb-4 px-6 font-bold text-sm transition-all ${
              activeTab === 'reviewed'
                ? 'text-[#800a0d] border-b-2 border-[#800a0d]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Đã đánh giá ({reviewedItems.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center w-full gap-4 pb-4 xl:w-auto xl:pb-0">
          {/* Rating Filter (Only in reviewed tab) */}
          {activeTab === 'reviewed' && (
            <div className="flex items-center bg-[#fdfaf5] border border-gray-200 rounded-xl px-4 py-3 hover:border-[#88694f] transition-all min-w-[150px]">
              <Filter size={18} className="mr-3 text-gray-400 shrink-0" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="bg-transparent text-base font-medium text-[#3e2714] outline-none cursor-pointer w-full"
              >
                <option value="all">Tất cả sao</option>
                <option value="5">5 Sao</option>
                <option value="4">4 Sao</option>
                <option value="3">3 Sao</option>
                <option value="2">2 Sao</option>
                <option value="1">1 Sao</option>
              </select>
            </div>
          )}

          {/* Sort Order */}
          <div className="flex items-center bg-[#fdfaf5] border border-gray-200 rounded-xl px-4 py-3 hover:border-[#88694f] transition-all min-w-37.5">
            <ArrowUpDown size={18} className="mr-3 text-gray-400 shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent text-base font-medium text-[#3e2714] outline-none cursor-pointer w-full"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 w-full md:w-80">
            <div className="bg-[#fdfaf5] border border-gray-200 rounded-xl flex items-center px-5 py-3 hover:border-[#88694f] transition-all">
              <Search size={18} className="mr-3 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={
                  activeTab === 'pending' ? 'Tìm tên, mã đơn...' : 'Tìm tên, nhận xét...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-base w-full outline-none font-medium text-[#3e2714] placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-gray-400 hover:text-red-500 shrink-0"
                >
                  <X size={14} />
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
              <p className="font-bold text-gray-500">
                {searchTerm ? 'Không tìm thấy sản phẩm nào' : 'Không có sản phẩm nào cần đánh giá'}
              </p>
            </div>
          )}

          {activeTab === 'pending' &&
            filteredPending.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-4 p-4 transition-all border border-gray-100 md:flex-row rounded-2xl hover:shadow-md"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-20 h-20 rounded-xl bg-gray-50"
                />
                <div className="flex-1 text-center md:text-left">
                  <Link
                    to={`/product/${item.productID}`}
                    className="font-bold text-[#3e2714] hover:text-[#800a0d] line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="flex items-center justify-center gap-1 mt-1 text-xs font-bold text-gray-400 md:justify-start">
                    <Package size={12} /> Đơn hàng: #{item.orderId?.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-[#800a0d] font-black text-sm mt-1">
                    {item.price?.toLocaleString()}đ
                  </p>
                </div>
                <button
                  onClick={() => openReviewModal(item)}
                  className="bg-[#800a0d] text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-md shrink-0 border border-transparent hover:bg-white hover:text-[#800a0d] hover:border-[#800a0d]"
                >
                  Đánh giá ngay
                </button>
              </div>
            ))}

          {/* TAB = REVIEWED */}
          {activeTab === 'reviewed' && filteredReviewed.length === 0 && (
            <div className="py-20 text-center border border-gray-200 border-dashed bg-gray-50 rounded-3xl">
              <Star className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="font-bold text-gray-500">
                {searchTerm ? 'Không tìm thấy đánh giá nào' : 'Bạn chưa có đánh giá nào'}
              </p>
            </div>
          )}

          {activeTab === 'reviewed' &&
            filteredReviewed.map((review, idx) => (
              <div
                key={idx}
                className="p-5 border border-gray-100 rounded-2xl space-y-4 bg-[#fdfaf5]/50 hover:bg-[#fdfaf5] transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={review.productID?.images?.[0]}
                      alt={review.productID?.productName}
                      className="object-cover bg-white shadow-sm w-14 h-14 rounded-xl"
                    />
                    <div>
                      <Link
                        to={`/product/${review.productID?._id}`}
                        className="font-bold text-[#3e2714] hover:text-[#800a0d] text-sm line-clamp-1"
                      >
                        {review.productID?.productName}
                      </Link>
                      <div className="flex gap-1 mt-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < review.rating ? 'currentColor' : 'none'}
                            strokeWidth={i < review.rating ? 0 : 2}
                            className={i >= review.rating ? 'text-gray-300' : ''}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="flex items-center gap-1 text-xs italic font-bold text-gray-400">
                      <Clock size={12} /> {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    {/* Action buttons appear on hover (md and above) and always on small screens */}
                    <div className="flex gap-2 mt-1 transition-opacity opacity-100 md:opacity-0 group-hover:opacity-100">
                      <button
                        title="Sửa đánh giá"
                        onClick={() => openEditModal(review)}
                        className="p-1.5 bg-white text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-50 shadow-sm transition-all"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        title="Xóa đánh giá"
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-1.5 bg-white text-red-600 rounded-lg border border-red-100 hover:bg-red-50 shadow-sm transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="relative p-4 text-sm italic text-gray-700 bg-white border border-gray-100 shadow-sm rounded-xl">
                  "{review.comment}"
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative animate-zoomIn border-t-8 border-[#800a0d]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute p-2 text-gray-400 transition-all rounded-full top-6 right-6 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black text-[#800a0d] mb-6 text-center tracking-tighter uppercase">
              {isEditing ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
            </h3>

            <div className="flex items-center gap-4 bg-[#fdfaf5] p-4 rounded-2xl mb-6 border border-gray-100">
              <img
                src={selectedProduct?.image}
                alt={selectedProduct?.name}
                className="object-cover w-16 h-16 bg-white shadow-sm rounded-xl"
              />
              <p className="font-bold text-sm text-[#3e2714] line-clamp-2">
                {selectedProduct?.name}
              </p>
            </div>

            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`transition-all ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200 hover:scale-110 hover:text-yellow-200'}`}
                >
                  <Star
                    size={36}
                    fill={rating >= star ? 'currentColor' : 'none'}
                    strokeWidth={rating >= star ? 0 : 2}
                  />
                </button>
              ))}
            </div>

            <div className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                className="w-full h-32 p-5 bg-[#fdfaf5] border border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-[#800a0d] transition-all font-medium text-sm text-gray-700"
              />
            </div>

            <button
              onClick={submitReview}
              disabled={submitting}
              className="w-full bg-[#800a0d] text-white py-4 rounded-2xl font-black shadow-xl hover:shadow-red-900/20 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center uppercase tracking-widest text-sm"
            >
              {submitting ? 'Đang cập nhật...' : isEditing ? 'Lưu thay đổi' : 'Gửi đánh giá'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyReviews
