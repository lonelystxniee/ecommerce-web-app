import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import {
  Truck,
  Headset,
  CreditCard,
  Gift,
  ChevronRight,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRef } from "react";

import Hero from "./Hero";
import CategorySection from "./CategorySection";
import { ProductItemSmall } from "./ProductItemSmall";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

export const SectionHeading = ({ title, outlined }) => (
  <div className="relative flex items-center justify-center my-10 z-1">
    <hr className="z-0 flex-1 w-40 h-px mr-3 border-primary" />
    <div
      className={`${outlined ? "bg-transparent" : "bg-section"} border-primary relative z-99 flex w-fit items-center border-t border-b p-px
          
        `}
    >
      <img
        alt="left"
        src={
          outlined
            ? "https://honglam.vn/_next/static/media/btn41-bg-left-hover.a799d898.png"
            : "https://honglam.vn/_next/static/media/btn47-bg-left-hover-solid.5a0f365f.png"
        }
        className="absolute -top-px -left-3 h-[calc(100%+2px)] w-[14px] object-contain"
      />
      <img
        alt="right"
        src={
          outlined
            ? "https://honglam.vn/_next/static/media/btn41-bg-right-hover.5de6cf95.png"
            : "https://honglam.vn/_next/static/media/btn47-bg-right-hover-solid.81fa6bf3.png"
        }
        className="absolute -top-px -right-3 h-[calc(100%+2px)] w-3.5 object-contain"
      />
      <div className="px-6 flex items-center justify-center min-w-50 md:min-w-77.5 h-10">
        <h3
          className={`${outlined ? "text-primary" : "text-white"} text-xl md:text-2xl lg:text-[30px] capitalize font-seagull font-bold tracking-tighter leading-none flex items-center`}
        >
          {title}
        </h3>
      </div>
    </div>
    <hr className="flex-1 h-px ml-3 border-primary" />
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and Filter states
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPaginatedLoading, setIsPaginatedLoading] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });

  const allProductRef = useRef();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_URL}/api/products?limit=100`),
          fetch(`${API_URL}/api/category`),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) {
          const mapped = prodData.products.map((p) => ({
            ...p,
            id: p._id,
            name: p.productName || p.name,
            image:
              p.images && p.images.length > 0
                ? p.images[0]
                : p.image || "https://via.placeholder.com/300",
          }));
          setAllProducts(mapped);
          setProducts(mapped);
        }

        if (catData.success) {
          setCategories(catData.categories);
        }

        if (!prodData.success && !catData.success) {
          setError("Failed to fetch data");
        }
      } catch (err) {
        setError("Error connecting to the server");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchPaginatedProducts = async (page = 1) => {
    setIsPaginatedLoading(true);
    try {
      let url = `http://localhost:5175/api/products?page=${page}&limit=12`;

      const { categoryId, minPrice, maxPrice, sort } = filters;
      if (categoryId || minPrice || maxPrice || sort !== "newest") {
        const queryParams = new URLSearchParams({
          page,
          limit: 12,
          ...(categoryId && { categoryId }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(sort && { sort }),
        });
        url = `http://localhost:5175/api/products/search?${queryParams.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        const mapped = data.products.map((p) => ({
          ...p,
          id: p._id,
          name: p.productName || p.name,
          image:
            p.images && p.images.length > 0
              ? p.images[0]
              : p.image || "https://via.placeholder.com/300",
        }));
        setPaginatedProducts(mapped);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.currentPage);
      }
    } catch (err) {
      console.error("Fetch paginated products error:", err);
    } finally {
      setIsPaginatedLoading(false);
    }
  };

  const scrollIntoAllProducts = () => {
    allProductRef.current.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  };

  useEffect(() => {
    fetchPaginatedProducts(currentPage);
  }, [currentPage, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-transparent text-primary">
        <p className="mb-4 text-xl font-bold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-white rounded-full hover:bg-[#800a0d] transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-transparent">
      {/* HERO */}
      <Hero categories={categories} />
      {/* SECTION 2: SERVICE BAR */}
      <div className="mx-auto mt-2.5 max-w-300 px-4">
        <div className="relative bg-[rgba(255,255,255,.6)]">
          <div className="grid grid-cols-2 border border-[#c0a884] md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {/* Giao hàng */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <div>
                  <img
                    src="https://honglam.vn/_next/static/media/menu-cs-1.e3475999.png"
                    alt="giao-hang-sieu-toc"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold text-text-primary">
                    Giao hàng siêu tốc
                  </h3>
                  <p className="hidden text-[13px] md:block text-text-primary">
                    Giao hàng trong 24h
                  </p>
                </div>
              </div>
            </div>

            {/* Tư vấn */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <div>
                  <img
                    src="https://honglam.vn/_next/static/media/menu-cs-2.98ae416c.png"
                    alt="tu-van-mien-phi"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold text-text-primary">
                    Tư vấn miễn phí
                  </h3>
                  <p className="hidden text-[13px] md:block text-text-primary">
                    Đội ngũ tư vấn tận tình
                  </p>
                </div>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <div>
                  <img
                    src="https://honglam.vn/_next/static/media/menu-cs-3.43ac297a.png"
                    alt="thanh-toan"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold text-text-primary">
                    Thanh toán
                  </h3>
                  <p className="hidden text-[13px] md:block text-text-primary">
                    Thanh toán khi nhận hàng
                  </p>
                </div>
              </div>
            </div>

            {/* Quà tặng */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <div>
                  <img
                    src="https://honglam.vn/_next/static/media/menu-cs-4.ada696ef.png"
                    alt="giai-phap-tieu-dung"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold text-text-primary">
                    Tiết kiệm tối ưu
                  </h3>
                  <p className="hidden text-[13px] md:block text-text-primary">
                    Ưu đãi cho đơn hàng lớn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SẢN PHẨM BÁN CHẠY */}
      <div className="px-4 mx-auto mt-10 text-center max-w-300 max-h-112.5">
        <SectionHeading title="Sản phẩm nổi bật" outlined />

        <div className="grid items-stretch grid-cols-2 grid-rows-3 gap-5 mt-8 md:grid-rows-2 md:grid-cols-3 max-h-112.5">
          {/* CỘT 1 - TRÊN (Sản phẩm 0) */}
          <div className="relative h-full">
            {products[0] && <OrangeCard product={products[0]} />}
          </div>

          {/* GIỮA – CHIẾM 2 HÀNG (Sản phẩm index 1) */}
          <div className="relative h-full row-span-2 group">
            <div
              onClick={() => navigate(`/product/${products[1]?.id}`)}
              className="flex flex-col items-center w-full h-full p-8 overflow-hidden text-white shadow-md cursor-pointer "
            >
              <img
                src="https://honglam.vn/_next/static/media/bg-hot-product-3.1f862014.jpg"
                alt=""
                className="absolute inset-0 w-full h-full"
              />
              <h3 className="relative mb-1 md:text-[26px] font-bold tracking-tight uppercase z-1 font-seagull ">
                {products[1]?.name}
              </h3>
              <p className="relative mb-2 text-sm md:text-[15px] z-1">
                {products[1]?.slogan}
              </p>

              <img
                src={products[1]?.images?.[0] || products[1]?.image}
                className="object-contain w-24 mb-1 transition-transform duration-500 md:w-48 drop-shadow-2xl"
                alt=""
              />

              <p className="mb-1 text-sm md:text-[15px] relatve z-1">Chỉ từ</p>
              <p className="mb-4 italic font-bold md:mb-6 md:text-3xl font-uvnvan relatve z-1">
                55.000đ
              </p>

              {/* NÚT MUA NGAY (Dẫn sang thanh toán) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(products[1]);
                  navigate(`/product/${products[1]?.id}`);
                }}
                className="relative flex items-center justify-center px-3 md:py-1 font-medium uppercase transition-all duration-150 ease-in-out border border-white rounded-[30px] text-[8px] md:text-[13px] whitespace-nowrap cursor-pointer md:w-36 hover:rounded-lg z-1"
              >
                <span>Mua ngay</span>
                <ChevronRight className="w-3 md:w-4" />
              </button>
            </div>
          </div>

          {/* CỘT 3 - TRÊN (Sản phẩm 2) */}
          <div className="relative h-full">
            {products[2] && <OrangeCard product={products[2]} />}
          </div>

          {/* CỘT 1 - DƯỚI (Sản phẩm 3) */}
          <div className="relative h-full">
            {products[3] && <OrangeCard product={products[3]} />}
          </div>

          {/* CỘT 3 - DƯỚI (Sản phẩm 4) */}
          <div className="relative h-full">
            {products[4] && <OrangeCard product={products[4]} />}
          </div>
        </div>
      </div>

      {/* SECTION 8: TẤT CẢ SẢN PHẨM (PAGINATION) */}
      <div ref={allProductRef} className="px-4 mx-auto mt-35 max-w-300">
        <SectionHeading title="Khám phá tất cả sản phẩm" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/50 p-6 rounded-[32px] border border-[#e0be91]/30 backdrop-blur-sm">
          <div className="flex flex-wrap items-center w-full gap-4 md:w-auto">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase text-[#88694f] ml-1 tracking-widest">
                Danh mục
              </span>
              <select
                value={filters.categoryId}
                onChange={(e) => {
                  setFilters({ ...filters, categoryId: e.target.value });
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#e0be91] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary min-w-48"
              >
                <option value="">Tất cả sản phẩm</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase text-[#88694f] ml-1 tracking-widest">
                Giá từ
              </span>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => {
                  setFilters({ ...filters, minPrice: e.target.value });
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#e0be91] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary w-32"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase text-[#88694f] ml-1 tracking-widest">
                Đến
              </span>
              <input
                type="number"
                placeholder="999,999"
                value={filters.maxPrice}
                onChange={(e) => {
                  setFilters({ ...filters, maxPrice: e.target.value });
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#e0be91] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary w-32"
              />
            </div>
          </div>

          <div className="flex flex-col w-full gap-1 md:w-auto">
            <span className="text-[10px] font-black uppercase text-[#88694f] ml-1 tracking-widest">
              Sắp xếp
            </span>
            <select
              value={filters.sort}
              onChange={(e) => {
                setFilters({ ...filters, sort: e.target.value });
                setCurrentPage(1);
              }}
              className="bg-white border border-[#e0be91] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary min-w-40"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        <div className="transition-all duration-300 min-h-200 md:min-h-250">
          {isPaginatedLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mt-8 md:grid-cols-3 lg:grid-cols-4">
                {paginatedProducts.map((p) => (
                  <ProductItemSmall key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                      scrollIntoAllProducts();
                    }}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold cursor-pointer transition-all ${currentPage === 1 ? "text-gray-300 border-gray-100 cursor-not-allowed" : "text-primary border-gray-200 hover:bg-primary hover:text-white"}`}
                  >
                    Trước
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        scrollIntoAllProducts();
                      }}
                      className={`w-10 h-10 cursor-pointer rounded-lg border text-sm font-bold transition-all ${currentPage === i + 1 ? "bg-primary text-white border-primary" : "text-gray-500 border-gray-200 hover:border-primary hover:text-primary"}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      scrollIntoAllProducts();
                    }}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg cursor-pointer border text-sm font-bold transition-all ${currentPage === totalPages ? "text-gray-300 border-gray-100 cursor-not-allowed" : "text-primary border-gray-200 hover:bg-primary hover:text-white"}`}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div id="all-products-section"></div>
      </div>

      {/* SECTION 4: GIẢI PHÁP QUÀ TẶNG */}
      <div className="px-4 mx-auto mt-20 text-center max-w-300">
        <SectionHeading title="Thực phẩm tươi sạch" />
        <p className="text-secondary-2 my-5 hidden px-[12%] text-center text-sm lg:block text-gray-600 font-light leading-relaxed italic">
          ClickGo Mart cam kết cung cấp các loại thực phẩm tươi sạch mỗi ngày,
          đảm bảo an toàn vệ sinh và nguồn gốc rõ ràng cho bữa ăn gia đình bạn
          thêm trọn vẹn.
        </p>
        <div className="grid grid-cols-1 gap-8 mt-10 md:grid-cols-3">
          {products.slice(5, 8).map((p) => (
            <GiftCard
              key={p.id}
              id={p.id}
              title={p.name}
              price={Math.floor(p.price / 1000)}
              img={p.image}
            />
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link
            to="/category/giai-phap-qua-tang"
            className="hover:text-primary group inline-flex items-center gap-2 text-base text-[#917359] font-bold transition-all underline-offset-4"
          >
            Xem tất cả sản phẩm{" "}
            <img
              src="https://honglam.vn/_next/static/media/btn-more.c2bbf147.png"
              className="h-4 transition-all group-hover:translate-x-2"
              alt="more"
            />
          </Link>
        </div>
      </div>

      {/* DYNAMIC CATEGORY SECTIONS */}
      {categories.slice(0, 4).map((cat, index) => {
        const banners = [
          "https://cdn.honglam.vn/honglam/HL_5_04_1_91ecb38969.jpg",
          "https://cdn.honglam.vn/honglam/Anh_web_Banh_keo_2_d4d154866e.jpg",
          "https://cdn.honglam.vn/honglam/Anh_web_Tra_1_a6f8a30e3a.jpg",
          "https://cdn.honglam.vn/honglam/Tet_website_ab5d5cb5d1.jpg",
        ];

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

        const categoryProducts = allProducts.filter((p) =>
          (p.categoryID || []).some(
            (c) => c._id === cat._id || c.name === cat.name,
          ),
        );

        if (categoryProducts.length === 0) return null;

        return (
          <CategorySection
            key={cat._id}
            title={cat.name}
            subtitle={cat.description || `Sản phẩm thuộc danh mục ${cat.name}`}
            bannerImage={banners[index % banners.length]}
            products={categoryProducts}
            categoryLink={`/category/${getSlug(cat.name)}`}
          />
        );
      })}

      {/* SECTION 6: TẠP CHÍ  */}
      <div className="px-4 mx-auto mt-20 max-w-300">
        {/* HEADER */}
        <div className="relative flex items-center justify-center md:justify-start">
          <SectionHeading title="Tạp chí" outlined />

          <div className="flex-1 hidden h-px -ml-1 bg-primary z-1 md:block"></div>

          <a
            href="/tap-chi-hong-lam"
            className="hidden text-sm text-primary text-nowrap md:block"
          >
            Xem thêm
          </a>

          <div className="hidden w-4 h-px bg-primary z-1 md:block"></div>
          <div className="border-primary z-1 hidden h-1.25 w-1.25 border md:block"></div>
        </div>

        {/* LIST */}
        <div className="mt-6 space-y-5">
          {/* Item 1 */}
          <div className="flex gap-4 group">
            <div className="h-fit border-2 border-[#e0be91] p-1">
              <a href="/nhin-lai-su-kien-ra-mat-bo-suu-tap-qua-tet-2026-ma-dao-khai-xuan-cua-o-mai-hong-lam">
                <img
                  src="https://cdn.honglam.vn/honglam/8_297d391f7a.png"
                  alt="post"
                  className="h-25 w-37.5 max-w-none object-cover md:h-30 md:w-44.25"
                />
              </a>
            </div>

            <div>
              <a
                href="/nhin-lai-su-kien-ra-mat-bo-suu-tap-qua-tet-2026-ma-dao-khai-xuan-cua-o-mai-hong-lam"
                className="text-base font-bold transition-all text-secondary-2 group-hover:text-primary line-clamp-2 md:text-lg"
              >
                Nhìn lại sự kiện ra mắt chi nhánh ClickGo Mart mới tại Hà Nội
              </a>

              <div className="mt-2 text-sm text-secondary-2 line-clamp-3">
                Ngày 14/12 vừa qua, ClickGo Mart chính thức khai trương chi
                nhánh mới tại khu vực Lạc Long Quân, mang đến không gian mua sắm
                hiện đại và tiện lợi cho người dân thủ đô…
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-4 group">
            <div className="h-fit border-2 border-[#e0be91] p-1">
              <a href="/o-mai-hong-lam-ghi-dau-an-tai-hoi-nghi-khoa-hoc-efsc-2025-lan-toa-tinh-hoa-qua-viet">
                <img
                  src="https://cdn.honglam.vn/honglam/01_Anh_bia_4b9d178e16.jpg"
                  alt="post"
                  className="h-25 w-37.5 max-w-none object-cover md:h-30 md:w-44.25"
                />
              </a>
            </div>

            <div>
              <a
                href="/o-mai-hong-lam-ghi-dau-an-tai-hoi-nghi-khoa-hoc-efsc-2025-lan-toa-tinh-hoa-qua-viet"
                className="text-base font-bold transition-all text-secondary-2 group-hover:text-primary line-clamp-2 md:text-lg"
              >
                Ô Mai Hồng Lam ghi dấu ấn tại Hội nghị Khoa học EFSC 2025
              </a>

              <div className="mt-2 text-sm text-secondary-2 line-clamp-3">
                Ô mai Hồng Lam tham gia Hội nghị EFSC 2025 ngày 14–15/11, lan
                tỏa tinh hoa quà Việt đến đông đảo đối tác và khách tham quan…
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex gap-4 group">
            <div className="h-fit border-2 border-[#e0be91] p-1">
              <a href="/hong-lam-chung-tay-ho-tro-truong-mam-non-kim-lu-thai-nguyen-sau-bao-lu">
                <img
                  src="https://cdn.honglam.vn/honglam/Thumb_4_0649d483dc.png"
                  alt="post"
                  className="h-25 w-37.5 max-w-none object-cover md:h-30 md:w-44.25"
                />
              </a>
            </div>

            <div>
              <a
                href="/hong-lam-chung-tay-ho-tro-truong-mam-non-kim-lu-thai-nguyen-sau-bao-lu"
                className="text-base font-bold transition-all text-secondary-2 group-hover:text-primary line-clamp-2 md:text-lg"
              >
                ClickGo Mart đồng hành cùng cộng đồng trong các hoạt động an
                sinh xã hội
              </a>

              <div className="mt-2 text-sm text-secondary-2 line-clamp-3">
                Không chỉ chú trọng vào chất lượng sản phẩm, ClickGo Mart còn
                luôn tích cực tham gia các hoạt động thiện nguyện, hỗ trợ những
                hoàn cảnh khó khăn tại nhiều địa phương…
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: THƯ VIỆN VIDEO */}
      <div className="px-4 mx-auto mt-20 max-w-300">
        {/* Header */}
        <div className="relative flex items-center justify-center md:justify-start">
          <SectionHeading title="Thư viện Video" outlined />

          <div className="flex-1 hidden h-px -ml-1 bg-primary z-1 md:block"></div>

          <a
            href="/video"
            className="hidden text-sm text-primary text-nowrap md:block"
          >
            Xem thêm
          </a>

          <div className="hidden w-4 h-px bg-primary z-1 md:block"></div>
          <div className="border-primary z-1 hidden h-1.25 w-1.25 border md:block"></div>
        </div>

        {/* Content */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Video lớn */}
            <a
              href="/hong-lam-gui-dang-que-nha"
              className="relative flex flex-col h-full cursor-pointer group"
            >
              <img
                src="https://cdn.honglam.vn/honglam/Hong_Lam_gui_dang_que_nha_video_thumnail_2b00974899.jpg"
                alt="Click Go gửi dáng quê nhà"
                className="flex-1 object-cover w-full"
              />

              <div className="flex items-center gap-2 mt-4">
                <div className="bg-primary group-hover:bg-secondary w-fit rounded-full p-1.5 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-white"
                  >
                    <path d="M6 4v16a1 1 0 0 0 1.524.852l13-8a1 1 0 0 0 0-1.704l-13-8A1 1 0 0 0 6 4z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-primary">
                  Click Go gửi dáng quê nhà
                </span>
              </div>
            </a>

            {/* Grid video nhỏ */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  title: "Ô mai Click Go - Bốn khúc tinh hoa",
                  link: "/o-mai-hong-lam-bon-khuc-tinh-hoa",
                  img: "https://cdn.honglam.vn/honglam/hqdefault_e8477e15b1.jpg",
                },
                {
                  title:
                    'The Best Friends | Cuộc thi làm Clip "Ơn thầy nghĩa bạn"',
                  link: "/the-best-friends-cuoc-thi-lam-clip-on-thay-nghia-ban-o-mai-hong-lam",
                  img: "https://cdn.honglam.vn/honglam/hqdefault_f5fa524c39.jpg",
                },
              ].map((video, index) => (
                <a
                  key={index}
                  href={video.link}
                  className="relative block cursor-pointer group"
                >
                  <img
                    src={video.img}
                    alt={video.title}
                    className="object-cover w-full h-40"
                  />

                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-primary group-hover:bg-secondary w-fit rounded-full p-1.5 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-white"
                      >
                        <path d="M6 4v16a1 1 0 0 0 1.524.852l13-8a1 1 0 0 0 0-1.704l-13-8A1 1 0 0 0 6 4z" />
                      </svg>
                    </div>
                    <span className="font-medium line-clamp-2 text-primary">
                      {video.title}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceItem = ({ img, text, last }) => (
  <div
    className={`flex items-center gap-3 justify-center ${!last ? "border-r border-[#ded3c2]" : ""} px-4 py-2`}
  >
    <img src={img} className="h-8" alt="" />
    <div className="text-primary uppercase text-[11px] font-bold text-left leading-tight">
      {text}
    </div>
  </div>
);

const OrangeCard = ({ product }) => {
  // const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="bg-[#f39200] p-4 text-white flex justify-between shadow-sm h-full relative overflow-hidden">
      <img
        src="https://honglam.vn/_next/static/media/bg-hot-product-3.1f862014.jpg"
        alt=""
        className="absolute inset-0 w-full h-full brightness-110"
      />
      <div className="flex flex-col items-start flex-1 text-left justify-evenly">
        <h3 className="relative text-xs font-bold sm:text-base lg:text-xl whitespace-nowrap z-1">
          {product?.name}
        </h3>
        <p className="relative text-xs lg:text-[15px] z-1 text-red">
          {product?.slogan}
        </p>

        <p className="md:text-xs lg:text-[15px] relative z-1 md:block hidden">
          Chỉ từ
        </p>
        <p className="relative text-xl lg:text-[30px] z-1 font-uvnvan italic mb-2">
          {product?.price.toLocaleString("vi")}đ
        </p>
        <button
          onClick={() => navigate(`/product/${product.id}`)}
          className="relative flex items-center justify-center px-3 md:py-1 font-medium uppercase transition-all duration-150 text-[8px] md:text-[13px] whitespace-nowrap ease-in-out border border-white rounded-[30px] cursor-pointer  md:w-30 hover:rounded-lg z-1"
        >
          <span>Mua ngay</span>
          <ChevronRight className="w-4" />
        </button>
      </div>
      <img
        src={product?.images?.[0] || product?.image}
        className="self-center object-contain w-24 transition-transform md:w-44 drop-shadow-md group-hover:rotate-6"
      />
    </div>
  );
};

const GiftCard = ({ id, title, price, img }) => {
  const navigate = useNavigate();
  // const { addToCart } = useCart();

  return (
    <div
      className="group relative mx-1 mt-10 p-0.5 shadow-sm transition-all hover:shadow-xl"
      style={{
        boxShadow: "rgb(250, 165, 25) 0px 0px 0px 1px",
        background:
          "linear-gradient(to left, rgb(253, 216, 155), rgb(251, 242, 226))",
      }}
    >
      {/* TIÊU ĐỀ MÀU CAM */}
      <div className="absolute top-0 z-20 flex items-center -translate-x-1/2 -translate-y-1/2 left-1/2">
        <div
          className="relative flex w-fit items-center border-t border-b border-secondary p-px bg-secondary
                        before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-secondary
                        after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-secondary"
        >
          <img
            alt="left"
            src="https://honglam.vn/_next/static/media/btn41-bg-left-hover-solid-2.6831ea9d.png"
            className="absolute -top-px -left-2.75 h-[calc(100%+2px)] w-3.5 object-contain"
          />
          <div className="flex items-center justify-center bg-secondary">
            <h3 className="flex items-center h-10 px-6 text-sm font-bold tracking-tighter capitalize md:text-base text-primary whitespace-nowrap">
              {title}
            </h3>
          </div>
          <img
            alt="right"
            src="https://honglam.vn/_next/static/media/btn41-bg-right-hover-solid-2.6d26b9cf.png"
            className="absolute -top-px -right-3 h-[calc(100%+2px)] w-3.5 object-contain"
          />
        </div>
      </div>

      {/* ẢNH SẢN PHẨM: Thêm Link để click vào ảnh là chuyển trang */}
      <Link to={`/product/${id}`} className="block overflow-hidden bg-white">
        <img
          src={img}
          className="object-cover w-full transition-transform duration-500 h-80"
          alt={title}
        />
      </Link>

      <div className="relative flex items-center justify-between px-4 py-5 overflow-hidden bg-transparent">
        <img
          src="https://honglam.vn/_next/static/media/bg_img.aee452a5.png"
          className="absolute left-0 object-cover w-full h-8 bottom-full z-3"
          alt=""
        />
        <p className="text-[#88694f] font-bold text-sm italic">
          Chỉ từ {price}K
        </p>

        {/* NÚT BẤM: Sửa thành điều hướng sang trang chi tiết */}
        <button
          onClick={() => navigate(`/product/${id}`)}
          className="flex items-center gap-1 bg-white text-primary border border-primary px-4 py-1.5 rounded-[30px] text-[10px] font-bold uppercase hover:bg-primary hover:rounded-sm hover:text-white transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
        >
          Mua ngay <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Home;
