import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Filter,
  ChevronDown,
  ShoppingBag,
  RefreshCcw,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const sidebarItems = [
  { name: "Giải pháp quà tặng", slug: "giai-phap-qua-tang" },
  { name: "Ô mai (xí muội)", slug: "o-mai" },
  { name: "Mứt Tết", slug: "mut-tet" },
  { name: "Bánh - Kẹo", slug: "banh-keo" },
  { name: "Chè, Trà đặc sản", slug: "che-tra" },
  { name: "Sản phẩm khác", slug: "san-pham-khac" },
  { name: "Thức uống", slug: "thuc-uong" },
];

const CategoryPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [isCatOpen, setIsCatOpen] = useState(true);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5175/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);
  }, [slug]);

  const getCatName = (s) => {
    const item = sidebarItems.find((i) => i.slug === s);
    return item ? item.name : "Sản phẩm";
  };

  const filteredProducts = products.filter((p) =>
    p.categoryID?.some(cat => cat.name.toLowerCase() === slug.toLowerCase())
  );

  return (
    <div className="bg-[#f7f4ef] min-h-screen font-sans text-[#3e2714]">
      {/* 1. BREADCRUMB */}
      <div className="bg-[#ede4d4] py-3 border-b border-gray-200">
        <div className="mx-auto max-w-[1200px] px-4 flex items-center gap-2 text-[12px] font-bold text-[#88694f] uppercase tracking-wider">
          <Link to="/" className="hover:text-[#9d0b0f]">
            Trang chủ
          </Link>
          <ChevronRight size={14} />
          <span>Sản phẩm</span>
          <ChevronRight size={14} />
          <span className="text-[#9d0b0f]">{getCatName(slug)}</span>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="mx-auto max-w-[1200px] px-4 py-8 flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-[260px] shrink-0">
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden sticky top-24">
            <div className="bg-[#9d0b0f] p-3 flex items-center gap-2 text-white">
              <Filter size={18} />
              <h3 className="text-sm font-bold uppercase tracking-widest">
                Bộ lọc
              </h3>
            </div>

            <div className="p-0 border-b border-gray-100">
              <button
                onClick={() => setIsCatOpen(!isCatOpen)}
                className="flex items-center justify-between w-full p-4 font-bold text-[13px] uppercase hover:bg-gray-50 transition-all text-[#3e2714]"
              >
                Danh mục sản phẩm
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${isCatOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${isCatOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <ul className="px-4 pb-4 space-y-2 overflow-y-auto max-h-[400px] custom-scrollbar">
                  {sidebarItems.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={`/category/${item.slug}`}
                        className={`text-[13px] block py-1.5 hover:text-[#9d0b0f] transition-colors ${slug === item.slug ? "text-[#9d0b0f] font-bold border-l-2 border-[#9d0b0f] pl-2" : "text-gray-600 pl-2"}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-6 border-b border-[#9d0b0f] pb-3 gap-3">
            <h2 className="text-2xl font-bold text-[#9d0b0f] uppercase tracking-tighter">
              {getCatName(slug)}
              <span className="text-gray-400 text-sm font-normal lowercase ml-2">
                ({filteredProducts.length} sản phẩm)
              </span>
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchProducts}
                className={`text-gray-400 hover:text-[#9d0b0f] ${loading ? "animate-spin" : ""}`}
              >
                <RefreshCcw size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="w-10 h-10 border-4 border-[#9d0b0f] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => {
                const displayPrice = p.price || 0;
                const displayImage = p.image || "";

                return (
                  <div
                    key={p._id}
                    className="bg-white p-2 border border-transparent hover:border-[#faa51980] hover:shadow-md transition-all flex flex-col group h-full"
                  >
                    <Link
                      to={`/product/${p._id}`}
                      className="block overflow-hidden relative"
                    >
                      <img
                        src={displayImage}
                        className="w-full aspect-square object-contain transition-transform duration-500 group-hover:scale-105"
                        alt={p.name}
                      />
                    </Link>
                    <div className="p-2 text-center flex-1 flex flex-col">
                      <Link
                        to={`/product/${p._id}`}
                        className="font-bold text-sm text-[#3e2714] line-clamp-1 hover:text-[#9d0b0f] transition-colors mb-1"
                      >
                        {p.name}
                      </Link>
                      <p className="text-[11px] text-gray-400 italic mb-3 line-clamp-1">
                        {p.slogan || "Tinh hoa quà Việt"}
                      </p>

                      {/* SỬA LỖI TẠI ĐÂY */}
                      <p className="text-[#9d0b0f] font-black text-base mb-4 mt-auto">
                        Chỉ từ {displayPrice.toLocaleString()}đ
                      </p>

                      <button
                        onClick={() => {
                          // Thêm vào giỏ hàng lấy biến thể đầu tiên làm mặc định
                          addToCart({
                            ...p,
                            id: `${p._id}-default`,
                            price: displayPrice,
                            image: displayImage,
                          });
                          alert(`Đã thêm ${p.name} vào giỏ!`);
                        }}
                        className="w-full border border-[#9d0b0f] text-[#9d0b0f] text-[11px] font-bold uppercase py-2 rounded-full hover:bg-[#9d0b0f] hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        Mua nhanh
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-lg border border-dashed text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p>Hiện chưa có sản phẩm nào trong danh mục này.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;
