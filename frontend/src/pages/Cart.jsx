import React, { useState, useMemo, useEffect } from 'react'
import { Minus, Plus, X, ShoppingBasket, Search, ChevronLeft, ChevronRight, Filter, ArrowUpDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const { cartItems, updateQuantity, setQuantity, toggleSelect, removeFromCart, totalPrice, totalItems } = useCart()

  // --- STATES CHO TÌM KIẾM, LỌC & PHÂN TRANG ---
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('default') // default, price-asc, price-desc
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 // Số sản phẩm mỗi trang

  // --- LOGIC LỌC & SẮP XẾP ---
  const filteredItems = useMemo(() => {
    let result = cartItems.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

    if (sortOrder === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [cartItems, searchTerm, sortOrder])

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredItems.slice(start, start + itemsPerPage)
  }, [filteredItems, currentPage])

  // Reset về trang 1 khi tìm kiếm hoặc sắp xếp
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1)
  }, [searchTerm, sortOrder])

  // Nếu giỏ hàng gốc trống
  if (cartItems.length === 0) {
    return (
      <div className="container px-4 py-20 mx-auto text-center">
        <div className="flex justify-center mb-6">
          <ShoppingBasket size={100} className="text-primary opacity-20" />
        </div>
        <h2 className="mb-4 text-2xl font-bold text-[#3e2714]">Giỏ hàng của bạn đang trống</h2>
        <p className="mb-8 text-[#88694f] italic">Hãy chọn thêm những thực phẩm tươi ngon cho gia đình nhé!</p>
        <Link to="/" className="bg-[#f39200] text-white text-[15px] px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg inline-block">
          Mua sắm ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-20 mx-auto max-w-300 animate-fadeIn">
      <h1 className="mb-8 text-3xl font-black text-[#3e2714] uppercase tracking-tighter border-b-2 border-primary pb-4">
        Giỏ hàng <span className="text-primary">({cartItems.length})</span>
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* CỘT TRÁI: DANH SÁCH & BỘ LỌC */}
        <div className="flex-[2] space-y-6">
          {/* THANH CÔNG CỤ (TÌM KIẾM & LỌC) */}
          <div className="flex flex-col md:flex-row gap-4 bg-[#f7f4ef] p-4 rounded-3xl border border-stone-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#88694f]" size={18} />
              <input
                type="text"
                placeholder="Tìm sản phẩm trong giỏ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl outline-none focus:ring-2 focus:ring-[#f39200] font-bold text-sm"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#88694f]" size={16} />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white rounded-xl border-none outline-none font-bold text-xs appearance-none cursor-pointer"
                >
                  <option value="default">Sắp xếp: Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>
          </div>

          {/* DANH SÁCH SẢN PHẨM */}
          <div className="space-y-4">
            {currentItems.length > 0 ? (
              currentItems.map((item) => {
                const cartImage = item.image || (item.images && item.images[0]) || ''
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 transition-all bg-white border border-gray-100 shadow-sm md:gap-6 md:p-6 rounded-3xl hover:shadow-md animate-fadeIn">
                    <input type="checkbox" checked={item.selected !== false} onChange={() => toggleSelect(item.id)} className="w-5 h-5 accent-[#9d0b0f] cursor-pointer" />
                    <img src={cartImage} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-2xl border bg-[#f7f4ef] p-2" />

                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-bold text-[#3e2714] line-clamp-1">{item.name}</h3>
                      <p className="text-[11px] md:text-xs text-[#88694f] font-medium italic">{item.label || 'Phân loại mặc định'}</p>
                      <p className="mt-1 font-black text-[#9d0b0f]">{item.price.toLocaleString()}đ</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center bg-[#f7f4ef] rounded-xl overflow-hidden border border-stone-200">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-2 px-3 text-[#88694f] hover:bg-stone-200 transition-colors">
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-10 font-black text-center text-[#3e2714] bg-transparent border-none focus:ring-0 appearance-none [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-2 px-3 text-[#88694f] hover:bg-stone-200 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-base md:text-lg font-black text-[#3e2714]">{(item.price * item.quantity).toLocaleString()}đ</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 text-[10px] font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest"
                      >
                        <X size={14} /> Xóa
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-10 text-center bg-white border-2 border-dashed rounded-3xl border-stone-200">
                <p className="text-[#88694f] italic font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
              </div>
            )}
          </div>

          {/* PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-3 rounded-2xl bg-white border border-stone-200 text-[#9d0b0f] disabled:opacity-20 hover:bg-[#f7f4ef] transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-black text-[#3e2714]">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-3 rounded-2xl bg-white border border-stone-200 text-[#9d0b0f] disabled:opacity-20 hover:bg-[#f7f4ef] transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG (Giữ nguyên giao diện đẹp) */}
        <div className="flex-1">
          <div className="sticky p-8 bg-white border-2 border-[#9d0b0f]/5 shadow-2xl rounded-[40px] top-24">
            <h3 className="text-xl font-black mb-6 text-[#9d0b0f] uppercase tracking-tighter flex items-center gap-2">
              <ShoppingBasket size={24} /> Tổng kết đơn hàng
            </h3>

            <div className="pb-6 space-y-4 text-sm border-b border-dashed border-stone-200">
              <div className="flex justify-between text-[#88694f] font-bold">
                <span>Tạm tính ({cartItems.length} món):</span>
                <span className="text-[#3e2714]">{totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-[#88694f] font-bold">
                <span>Phí giao hàng:</span>
                <span className="text-green-600 uppercase text-[10px] font-black bg-green-50 px-2 py-1 rounded-md">Miễn phí</span>
              </div>
            </div>

            <div className="flex justify-between py-6">
              <span className="font-black text-lg text-[#3e2714] uppercase">Tổng cộng:</span>
              <span className="text-3xl font-black text-[#9d0b0f] tracking-tighter">{totalPrice.toLocaleString()}đ</span>
            </div>

            {totalItems > 0 ? (
              <Link
                to="/checkout"
                className="block py-4 mb-4 text-lg font-black text-center text-white transition-all shadow-lg bg-[#9d0b0f] rounded-2xl hover:bg-black active:scale-95 uppercase tracking-widest"
              >
                Tiến hành thanh toán
              </Link>
            ) : (
              <button disabled className="w-full py-4 mb-4 text-lg font-black tracking-widest text-center text-white uppercase transition-all bg-gray-400 cursor-not-allowed rounded-2xl">
                Vui lòng chọn sản phẩm
              </button>
            )}

            <Link to="/" className="block text-center text-[#88694f] font-bold text-sm hover:text-[#9d0b0f] transition-colors">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
