import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Heart,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setPagination] = useState({});
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Local state for UI inputs (to keep them responsive)
  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
  });

  // Sync local filters with URL when URL changes (e.g. back button)
  useEffect(() => {
    setFilters({
      categoryId: searchParams.get("categoryId") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "newest",
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/category`);
        const data = await response.json();
        if (data.success) setCategories(data.categories);
      } catch (error) {
        console.error("Fetch categories error:", error);
      }
    };
    fetchCategories();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      // Ensure q is present if it's in the state but maybe not in searchParams (though here we use searchParams as source)

      const response = await fetch(
        `${API_URL}/api/products/search?${params.toString()}`,
      );
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

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Trigger on any URL change

  const handleFilterChange = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(name, value);
    else newParams.delete(name);
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen pt-12 pb-20 bg-transparent">
      <div className="px-4 mx-auto max-w-300">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b border-[#e0be91] pb-6 gap-4">
          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold text-primary">
              Kết quả tìm kiếm
            </h1>
            <p className="italic text-secondary-2">
              {query
                ? `Tìm thấy ${products.length} sản phẩm cho từ khóa "${query}"`
                : "Vui lòng nhập từ khóa để tìm kiếm"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-secondary-2">
                Sắp xếp:
              </span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="bg-white border border-[#e0be91] rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* SIDEBAR FILTERS */}
          <aside className="w-full space-y-6 md:w-64 shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0be91]/30">
              <h3 className="flex items-center gap-2 pb-3 mb-4 font-bold border-b border-gray-100 text-primary">
                <Filter size={18} /> Bộ lọc
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block mb-3 text-sm font-bold text-secondary-2">
                  Danh mục
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) =>
                    handleFilterChange("categoryId", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-primary"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block mb-3 text-sm font-bold text-secondary-2">
                  Khoảng giá (VNĐ)
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:border-primary"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setFilters({
                    categoryId: "",
                    minPrice: "",
                    maxPrice: "",
                    sort: "newest",
                  });
                  setSearchParams({ q: query });
                }}
                className="w-full py-2 mt-6 text-xs font-bold transition-colors border rounded-lg text-primary border-primary/20 hover:bg-primary/5"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex flex-col h-full overflow-hidden transition-all duration-500 bg-white border border-transparent shadow-sm group rounded-2xl hover:shadow-xl hover:border-secondary"
                  >
                    <Link
                      to={`/product/${product._id}`}
                      className="relative block h-48 md:h-64 overflow-hidden bg-[#f7f4ef]"
                    >
                      <img
                        src={
                          product.images?.[0] ||
                          product.image ||
                          "https://via.placeholder.com/300"
                        }
                        alt={product.productName}
                        className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-110"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product._id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-xl shadow-sm z-10 transition-all active:scale-90"
                      >
                        <Heart
                          size={18}
                          className={isInWishlist(product._id) ? "text-[#9d0b0f] fill-[#9d0b0f]" : "text-gray-400"}
                        />
                      </button>
                      <div className="absolute inset-0 transition-all duration-500 bg-black/0 group-hover:bg-black/5" />
                    </Link>

                    <div className="flex flex-col flex-1 p-4">
                      <Link
                        to={`/product/${product._id}`}
                        className="flex items-center h-12 mb-1 text-sm font-bold leading-tight transition-colors md:text-base text-text-primary line-clamp-2 hover:text-primary"
                      >
                        {product.productName}
                      </Link>
                      <p className="h-4 mb-3 text-xs italic font-medium text-secondary-2 line-clamp-1">
                        {product.productCode}
                      </p>

                      <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                            Chỉ từ
                          </p>
                          <p className="text-lg font-black text-primary">
                            {product.price?.toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            addToCart({
                              ...product,
                              id: product._id,
                              name: product.productName,
                            });
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
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#e0be91]">
                <img
                  src="https://honglam.vn/_next/static/media/cart-empty-new.0094b92b.png"
                  alt="No results"
                  className="w-48 mx-auto mb-6 opacity-30 grayscale"
                />
                <p className="text-xl font-bold text-secondary-2">
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="mt-2 text-gray-500">
                  Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
