import React from "react";
import { Trash2, ShoppingBasket, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const WishlistPage = () => {
    const { wishlistItems, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 6;

    const handleAddToCart = (product) => {
        addToCart({
            ...product,
            id: product._id,
            name: product.productName,
            price: product.price,
            quantity: 1,
            image: product.images && product.images.length > 0 ? product.images[0] : product.image
        });
        toast.success("Đã thêm vào giỏ hàng!");
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="container px-4 py-20 mx-auto text-center">
                <div className="flex justify-center mb-6">
                    <Heart size={100} className="text-gray-200" />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-[#3e2714]">
                    Danh sách yêu thích trống
                </h2>
                <p className="mb-8 text-[#88694f]">
                    Hãy thêm những sản phẩm bạn yêu thích vào đây nhé!
                </p>
                <Link
                    to="/"
                    className="bg-[#9d0b0f] text-white text-[15px] px-8 py-3 rounded-xl font-bold hover:bg-red-800 transition-colors shadow-lg"
                >
                    Khám phá ngay
                </Link>
            </div>
        );
    }

    return (
        <div className="px-4 pt-4 pb-20 mx-auto max-w-300">
            <h1 className="mb-8 text-3xl font-bold text-[#3e2714] flex items-center gap-3">
                <Heart className="text-[#9d0b0f] fill-[#9d0b0f]" />
                Sản phẩm yêu thích ({wishlistItems.length})
            </h1>

            {/* Pagination Logic */}
            {(() => {
                const totalPages = Math.ceil(wishlistItems.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const currentItems = wishlistItems.slice(startIndex, startIndex + itemsPerPage);

                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {currentItems.map((item) => {
                                const displayImage = item.images && item.images.length > 0 ? item.images[0] : item.image;

                                return (
                                    <div
                                        key={item._id}
                                        className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                                    >
                                        <Link to={`/product/${item._id}`} className="block relative aspect-square overflow-hidden bg-[#f7f4ef]">
                                            <img
                                                src={displayImage}
                                                alt={item.productName}
                                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                                            />
                                        </Link>

                                        <div className="p-6 flex flex-col flex-1">
                                            <Link to={`/product/${item._id}`} className="text-lg font-bold text-[#3e2714] hover:text-[#9d0b0f] transition-colors line-clamp-2 mb-2">
                                                {item.productName}
                                            </Link>

                                            <p className="text-sm text-[#88694f] italic mb-4 line-clamp-1">
                                                {item.slogan || "Gốm Phù Lãng - Tinh hoa quà Việt"}
                                            </p>

                                            <div className="mt-auto">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-xl font-black text-[#9d0b0f]">
                                                        {item.price?.toLocaleString()}đ
                                                    </span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAddToCart(item)}
                                                        className="flex-1 bg-[#f39200] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <ShoppingBasket size={18} /> Thêm giỏ
                                                    </button>
                                                    <button
                                                        onClick={() => toggleWishlist(item._id)}
                                                        className="p-2.5 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                        title="Xóa khỏi yêu thích"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-[#88694f] hover:bg-[#800a0d] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#88694f]"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all border ${currentPage === i + 1
                                                ? "bg-[#800a0d] text-white border-[#800a0d] shadow-lg"
                                                : "bg-white text-[#88694f] border-gray-200 hover:border-[#800a0d] hover:text-[#800a0d]"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-[#88694f] hover:bg-[#800a0d] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#88694f]"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                );
            })()}
        </div>
    );
};

export default WishlistPage;
