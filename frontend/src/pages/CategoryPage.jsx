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

import toast from "react-hot-toast";

const CategoryPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [isCatOpen, setIsCatOpen] = useState(true);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSlug = (name) => {
    return (name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^a-z0-9\s-]|(?<=\s)\s)/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("http://localhost:5175/api/products?limit=100"),
        fetch("http://localhost:5175/api/category")
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodData.success) {
        setProducts(prodData.products);
      }
      if (catData.success) {
        setCategories(catData.categories);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    window.scrollTo(0, 0);
  }, [slug]);

  const currentCategory = categories.find(cat => getSlug(cat.name) === slug);
  const catName = currentCategory ? currentCategory.name : "Sản phẩm";

  const filteredProducts = products.filter((p) =>
    p.categoryID?.some(cat => getSlug(cat.name) === slug)
  );

  return (
    <div className="bg-[url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')] min-h-screen text-[#3e2714]">
      {/* 1. BREADCRUMB */}
      <div className="py-3 ">
        <div className="mx-auto max-w-300 px-4 flex items-center gap-2 text-xs font-bold text-[#88694f] tracking-wider">
          <Link to="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <ChevronRight size={14} />
          <span>Sản phẩm</span>
          <ChevronRight size={14} />
          <span className="text-primary">{catName}</span>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex flex-col gap-6 px-4 py-8 mx-auto max-w-300 md:flex-row">
        <aside className="w-full md:w-65 shrink-0">
          <div className="sticky overflow-hidden bg-white border border-gray-200 rounded shadow-sm top-24">
            <div className="flex items-center gap-2 p-3 text-white bg-primary">
              <Filter size={18} />
              <h3 className="text-sm font-bold tracking-widest uppercase">
                Bộ lọc
              </h3>
            </div>

            <div className="p-0 border-b border-gray-100">
              <button
                onClick={() => setIsCatOpen(!isCatOpen)}
                className="flex items-center justify-between w-full p-4 font-bold text-[13px] uppercase hover:bg-gray-50 transition-all cursor-pointer text-[#3e2714]"
              >
                Danh mục sản phẩm
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${isCatOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${isCatOpen ? "max-h-100 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <ul className="px-4 pb-4 space-y-2 overflow-y-auto max-h-100 custom-scrollbar">
                  {categories.map((item) => {
                    const itemSlug = getSlug(item.name);
                    return (
                      <li key={item._id}>
                        <Link
                          to={`/category/${itemSlug}`}
                          className={`text-[13px] block py-1.5 hover:text-primary transition-colors ${slug === itemSlug ? "text-primary font-bold border-l-2 border-primary pl-2" : "text-gray-600 pl-2"}`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex flex-col items-end justify-between gap-3 pb-3 mb-6 border-b sm:flex-row sm:items-center border-primary">
            <h2 className="text-2xl font-bold tracking-tighter uppercase text-primary">
              {catName}
              <span className="ml-2 text-sm font-normal text-gray-400 lowercase">
                ({filteredProducts.length} sản phẩm)
              </span>
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchInitialData}
                className={`text-gray-400 hover:text-primary ${loading ? "animate-spin" : ""}`}
              >
                <RefreshCcw size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="w-10 h-10 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p) => {
                const displayPrice = p.price || 0;
                const displayImage = p.images?.[0] || p.image || "";

                return (
                  <div
                    key={p._id}
                    className="bg-white p-2 border border-transparent hover:border-[#faa51980] hover:shadow-md transition-all flex flex-col group h-full"
                  >
                    <Link
                      to={`/product/${p._id}`}
                      className="relative block overflow-hidden"
                    >
                      <img
                        src={displayImage}
                        className="object-contain w-full transition-transform duration-500 aspect-square group-hover:scale-105"
                        alt={p.productName || p.name}
                      />
                    </Link>
                    <div className="flex flex-col flex-1 p-2 text-center">
                      <Link
                        to={`/product/${p._id}`}
                        className="font-bold text-sm text-[#3e2714] line-clamp-1 hover:text-primary transition-colors mb-1"
                      >
                        {p.productName || p.name}
                      </Link>
                      <p className="text-[11px] text-gray-400 italic mb-3 line-clamp-1">
                        {p.slogan || "Tinh hoa quà Việt"}
                      </p>

                      <p className="mt-auto mb-4 text-base font-black text-primary">
                        Chỉ từ {displayPrice.toLocaleString()}đ
                      </p>

                      <button
                        onClick={() => {
                          addToCart({
                            ...p,
                            id: `${p._id}-default`,
                            price: displayPrice,
                            image: displayImage,
                            name: p.productName || p.name,
                          });
                          toast.success(`Đã thêm ${p.productName || p.name} vào giỏ!`);
                        }}
                        className="w-full border border-primary text-primary text-[11px] font-bold uppercase py-2 rounded-full hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        Mua nhanh
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center text-gray-400 bg-white border border-dashed rounded-lg">
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
