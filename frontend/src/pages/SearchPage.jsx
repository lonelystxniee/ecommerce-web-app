import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ShoppingCart, ChevronRight, Filter, SlidersHorizontal } from "lucide-react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5175/api/products/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (data.success) {
                    setProducts(data.products);
                    setPagination(data.pagination);
                }
            } catch (error) {
                console.error("Search fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchResults();
        } else {
            setLoading(false);
        }
    }, [query]);

    return (
        <div className="min-h-screen bg-[#f7f4ef] pt-32 pb-20">
            <div className="max-w-300 mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#e0be91] pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">Kết quả tìm kiếm</h1>
                        <p className="text-secondary-2 italic">
                            {query ? `Tìm thấy ${products.length} sản phẩm cho từ khóa "${query}"` : "Vui lòng nhập từ khóa để tìm kiếm"}
                        </p>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <button className="flex items-center gap-2 px-4 py-2 border border-[#e0be91] rounded-full text-sm font-medium text-secondary-2 hover:bg-white transition-all">
                            <SlidersHorizontal size={16} /> Sắp xếp
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-[#e0be91] rounded-full text-sm font-medium text-secondary-2 hover:bg-white transition-all">
                            <Filter size={16} /> Lọc
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full border border-transparent hover:border-secondary">
                                <Link to={`/product/${product._id}`} className="relative block h-48 md:h-64 overflow-hidden bg-[#f7f4ef]">
                                    <img
                                        src={product.images?.[0] || product.image || "https://via.placeholder.com/300"}
                                        alt={product.productName}
                                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500" />
                                </Link>

                                <div className="p-4 flex flex-col flex-1">
                                    <Link to={`/product/${product._id}`} className="text-sm md:text-base font-bold text-text-primary mb-1 line-clamp-2 hover:text-primary transition-colors h-12 flex items-center leading-tight">
                                        {product.productName}
                                    </Link>
                                    <p className="text-xs text-secondary-2 mb-3 h-4 line-clamp-1 italic font-medium">
                                        {product.productCode}
                                    </p>

                                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Chỉ từ</p>
                                            <p className="text-lg font-black text-primary">
                                                {product.price?.toLocaleString("vi-VN")}đ
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                addToCart({ ...product, id: product._id, name: product.productName });
                                                toast.success("Đã thêm vào giỏ hàng");
                                            }}
                                            className="bg-secondary p-2.5 rounded-xl text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                                        >
                                            <ShoppingCart size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <img
                            src="https://honglam.vn/_next/static/media/cart-empty-new.0094b92b.png"
                            alt="No results"
                            className="w-48 mx-auto mb-6 opacity-50 grayscale"
                        />
                        <p className="text-xl font-bold text-secondary-2">Không tìm thấy sản phẩm nào phù hợp</p>
                        <p className="text-gray-500 mt-2">Hãy thử tìm kiếm với từ khóa khác</p>
                        <Link to="/" className="inline-block mt-8 px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-[#800a0d] transition-all">
                            Quay lại cửa hàng
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
