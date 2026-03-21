import React from "react";
import {
  Trash2,
  ShoppingBasket,
  Heart,
  ChevronLeft,
  ChevronRight,
  Home,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const WishlistPage = () => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(wishlistItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = wishlistItems.slice(startIndex, startIndex + itemsPerPage);

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      id: product._id,
      name: product.productName,
      price: product.price,
      quantity: 1,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : product.image,
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  // --- EMPTY STATE ---
  if (wishlistItems.length === 0) {
    return (
      <div
        className="min-h-screen pt-6 pb-20 bg-[#f7f4ef]"
        style={{
          backgroundImage: `url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')`,
        }}
      >
        {/* Breadcrumb */}
        <div className="max-w-[1200px] mx-auto px-4 mb-8 flex items-center gap-2 text-[12px] font-bold uppercase text-[#88694f]">
          <Link to="/" className="flex items-center gap-1 hover:text-[#800a0d] transition-colors">
            <Home size={14} /> Trang chủ
          </Link>
          <ChevronRight size={14} />
          <span className="text-[#800a0d]">Sản phẩm yêu thích</span>
        </div>

        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-20 text-center">
            <div className="w-28 h-28 bg-[#fdfaf5] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Heart size={52} className="text-[#800a0d]/20" />
            </div>
            <h2 className="text-3xl font-black text-[#3e2714] mb-3 tracking-tight">
              Danh sách yêu thích trống
            </h2>
            <p className="text-[#88694f] mb-10 text-sm font-medium italic max-w-xs mx-auto">
              Hãy thêm những sản phẩm bạn yêu thích vào đây để dễ dàng tìm lại sau!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#800a0d] text-white px-10 py-3.5 rounded-full font-black text-sm tracking-widest uppercase shadow-xl hover:rounded-lg transition-all active:scale-95"
            >
              <ShoppingCart size={16} /> Khám phá ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN ---
  return (
    <div
      className="min-h-screen pt-6 pb-20 bg-[#f7f4ef]"
      style={{
        backgroundImage: `url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')`,
      }}
    >
      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4 mb-8 flex items-center gap-2 text-[12px] font-bold uppercase text-[#88694f]">
        <Link to="/" className="flex items-center gap-1 hover:text-[#800a0d] transition-colors">
          <Home size={14} /> Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#800a0d]">Sản phẩm yêu thích</span>
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#800a0d] rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
            <Heart size={22} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#800a0d] tracking-tighter">
              Sản phẩm yêu thích
            </h1>
            <p className="text-xs font-bold text-[#88694f]">
              {wishlistItems.length} sản phẩm đang được lưu
            </p>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-10">
          {currentItems.map((item) => {
            const displayImage =
              item.images && item.images.length > 0 ? item.images[0] : item.image;

            return (
              <div
                key={item._id}
                className="group bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <Link
                  to={`/product/${item._id}`}
                  className="relative block overflow-hidden bg-[#fdfaf5] aspect-square"
                >
                  <img
                    src={displayImage}
                    alt={item.productName}
                    className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110 p-3"
                  />
                  {/* Remove button overlay */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(item._id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                    title="Xóa khỏi yêu thích"
                  >
                    <Trash2 size={14} />
                  </button>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link
                    to={`/product/${item._id}`}
                    className="block text-sm font-bold text-[#3e2714] hover:text-[#800a0d] transition-colors line-clamp-2 mb-1 leading-snug"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-xs text-[#88694f] italic mb-3 line-clamp-1">
                    {item.slogan || "Tinh hoa quà Việt"}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-black text-[#800a0d]">
                      {item.price?.toLocaleString()}đ
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-[#f39200] text-white py-2 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBasket size={14} /> Thêm vào giỏ
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-full border border-gray-200 bg-white text-[#88694f] hover:bg-[#800a0d] hover:text-white hover:border-[#800a0d] transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={20} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-full font-black text-sm transition-all ${currentPage === i + 1
                    ? "bg-[#800a0d] text-white shadow-lg"
                    : "bg-white text-[#88694f] border border-gray-200 hover:border-[#800a0d] hover:text-[#800a0d]"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-full border border-gray-200 bg-white text-[#88694f] hover:bg-[#800a0d] hover:text-white hover:border-[#800a0d] transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
