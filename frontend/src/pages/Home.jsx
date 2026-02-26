import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Clock,
  Package,
  Sparkles,
  Gift,
  Cake,
  Coffee,
  Wine,
  ChevronRight,
  ShoppingBag,
  Truck,
  Headset,
  CreditCard,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const bannerImages = [
  "https://cdn.honglam.vn/honglam/Tet_website_ab5d5cb5d1.jpg",
  "https://cdn.honglam.vn/honglam/HL_5_04_1_91ecb38969.jpg",
  "https://cdn.honglam.vn/honglam/Sac_Hoa_1_06cf1c5837.jpg",
];

const products = [
  {
    id: 1,
    name: "Mơ 5",
    slogan: "Chua, cay, ngọt, dẻo",
    price: 30000,
    image: "https://cdn.honglam.vn/honglam/D_HL_5_1_f485410bab_7b43e4c182.png",
  },
  {
    id: 2,
    name: "Sấu bao tử",
    slogan: "Chua, cay, giòn",
    price: 55000,
    image:
      "https://cdn.honglam.vn/honglam/hong_lam_Sau_bao_tu_01_1_ed570b459b_1_38b07a16d4_1_eca889aad6.png",
  },
  {
    id: 3,
    name: "Mơ dẻo Chùa Hương",
    slogan: "Chua, ngọt, dẻo, gừng",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Mo_chua_huong_337d43cd04_1eebaacf29.png",
  },
  {
    id: 4,
    name: "Mận dẻo đặc biệt",
    slogan: "Chua, ngọt, dẻo",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Man_deo_DB_a49979c621_78a02f0269.png",
  },
  {
    id: 5,
    name: "Mơ dẻo Nam Định",
    slogan: "Chua, ngọt, dẻo, gừng",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Mo_chua_huong_337d43cd04_1eebaacf29.png",
  },
  {
    id: 6,
    name: "Mơ dẻo chua",
    slogan: "Chua, ngọt, dẻo, gừng",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Mo_chua_huong_337d43cd04_1eebaacf29.png",
  },
  {
    id: 7,
    name: "Mơ  5",
    slogan: "Chua, cay, ngọt, dẻo",
    price: 30000,
    image: "https://cdn.honglam.vn/honglam/D_HL_5_1_f485410bab_7b43e4c182.png",
  },
  {
    id: 8,
    name: "Sấu bao tử",
    slogan: "Chua, cay, giòn",
    price: 55000,
    image:
      "https://cdn.honglam.vn/honglam/hong_lam_Sau_bao_tu_01_1_ed570b459b_1_38b07a16d4_1_eca889aad6.png",
  },
  {
    id: 9,
    name: "Mơ dẻo Chùa Hương",
    slogan: "Chua, ngọt, dẻo, gừng",
    price: 30000,
    image:
      "https://cdn.honglam.vn/honglam/D_Mo_chua_huong_337d43cd04_1eebaacf29.png",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const sliderImages = [...bannerImages, bannerImages[0]];

  const [bannerIndex, setBannerIndex] = React.useState(0);
  const [enableTransition, setEnableTransition] = React.useState(true);

  const nextBanner = () => {
    setBannerIndex((prev) => prev + 1);
  };

  const ITEMS_PER_SLIDE = 3;
  const totalSlides = Math.ceil(products.length / ITEMS_PER_SLIDE);

  const [slideIndex, setSlideIndex] = React.useState(0);

  const nextSlide = () => {
    setSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  React.useEffect(() => {
    if (bannerIndex === bannerImages.length) {
      setTimeout(() => {
        setEnableTransition(false);
        setBannerIndex(0);
      }, 500);
    } else {
      setEnableTransition(true);
    }
  }, [bannerIndex]);

  // auto chạy
  React.useEffect(() => {
    const timer = setInterval(nextBanner, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#f7f4ef] min-h-screen pb-20 font-sans">
      {/* SECTION 1: HERO (Sidebar + Banner) */}
      <section className="px-4 pt-4 mx-auto max-w-300">
        {/* Ép chiều cao chung */}
        <div className="flex gap-4 h-90">
          {/* ===== SIDEBAR ===== */}
          <div className="hidden h-full md:block w-65">
            <div className="relative h-full bg-[#9d0b0f] text-white shadow-lg p-1.5">
              <div className="relative h-full border border-[#d4a373]">
                {/* 4 góc trang trí */}
                <span className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-[#d4a373]" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-[#d4a373]" />
                <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-[#d4a373]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-[#d4a373]" />

                {/* Nội dung */}
                <div className="bg-[#9d0b0f] h-full flex flex-col">
                  {/* Header */}
                  <div className="flex h-11 items-center gap-2 px-4 bg-[#800a0d] border-b border-[#a10c0d] shrink-0">
                    <Menu className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase">
                      Danh mục sản phẩm
                    </span>
                  </div>

                  {/* Menu */}
                  <div className="flex-1">
                    <Link
                      to="/category/giai-phap-qua-tang"
                      className="flex h-11 items-center gap-2 px-4 border-b border-[#a10c0d] hover:bg-[rgba(0,0,0,.15)] cursor-pointer"
                    >
                      <Clock className="w-5 h-5" />
                      <span>Giải pháp quà tặng, quà biếu</span>
                    </Link>

                    <Link
                      to="/category/o-mai"
                      className="flex h-11 items-center gap-2 px-4 border-b border-[#a10c0d] hover:bg-[rgba(0,0,0,.15)] cursor-pointer"
                    >
                      <Package className="w-5 h-5" />
                      <span>Ô mai (xí muội)</span>
                    </Link>

                    <Link
                      to="/category/mut-tet"
                      className="flex h-11 items-center gap-2 px-4 border-b border-[#a10c0d] hover:bg-[rgba(0,0,0,.15)] cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Mứt Tết</span>
                    </Link>

                    <Link
                      to="/category/banh-keo"
                      className="flex h-11 items-center gap-2 px-4 border-b border-[#a10c0d] hover:bg-[rgba(0,0,0,.15)] cursor-pointer"
                    >
                      <Gift className="w-5 h-5" />
                      <span>Bánh - Kẹo</span>
                    </Link>

                    <Link
                      to="/category/che-tra"
                      className="flex h-11 items-center gap-2 px-4 border-b border-[#a10c0d] hover:bg-[rgba(0,0,0,.15)] cursor-pointer"
                    >
                      <Cake className="w-5 h-5" />
                      <span>Chè, Trà đặc sản</span>
                    </Link>

                    <Link
                      to="/category/san-pham-khac"
                      className="flex h-11 items-center gap-2 px-4 border-b border-[#a10c0d] hover:bg-[rgba(0,0,0,.15)] cursor-pointer"
                    >
                      <Coffee className="w-5 h-5" />
                      <span>Sản phẩm khác</span>
                    </Link>

                    <Link
                      to="/category/thuc-uong"
                      className="flex h-11 items-center gap-2 px-4 hover:bg-[rgba(0,0,0,.15)] cursor-pointer"
                    >
                      <Wine className="w-5 h-5" />
                      <span>Thức uống</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== BANNER ===== */}
          <div className="flex-1 h-full">
            <div className="relative h-full bg-[#9d0b0f] shadow-lg p-1.5">
              <div className="relative h-full border border-[#d4a373]">
                {/* 4 góc trang trí */}
                <span className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-[#d4a373]" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-[#d4a373]" />
                <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-[#d4a373]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-[#d4a373]" />

                {/* SLIDER */}
                <div className="relative h-full bg-[#f7f4ef] overflow-hidden">
                  <div
                    className={`flex h-full ${
                      enableTransition
                        ? "transition-transform duration-500 ease-in-out"
                        : ""
                    }`}
                    style={{
                      transform: `translateX(-${bannerIndex * 100}%)`,
                    }}
                  >
                    {sliderImages.map((img, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-center h-full min-w-full"
                      >
                        <img
                          src={img}
                          alt="Banner"
                          className="object-contain max-w-full max-h-full"
                        />
                      </div>
                    ))}
                  </div>

                  {/* NÚT NEXT – luôn trượt cùng chiều */}
                  <button
                    onClick={nextBanner}
                    className="absolute right-2 top-1/2 -translate-y-1/2 
                     bg-white/80 hover:bg-white text-[#9d0b0f] 
                     p-1 rounded-full shadow-md transition"
                  >
                    <img
                      alt="next"
                      src="https://honglam.vn/_next/static/media/slick-next-xs-hover.c14e777f.png"
                      className="object-cover w-8 h-8"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SERVICE BAR */}
      <div className="mx-auto mt-2.5 max-w-300 px-4">
        <div className="relative bg-[rgba(255,255,255,.6)]">
          <div className="grid grid-cols-2 border border-[#c0a884] md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {/* Giao hàng */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <Truck className="h-10 w-10 text-[#9d0b0f]" />
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold">
                    Giao hàng siêu tốc
                  </h3>
                  <p className="hidden text-[13px] md:block">
                    Giao hàng trong 24h
                  </p>
                </div>
              </div>
            </div>

            {/* Tư vấn */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <Headset className="h-10 w-10 text-[#9d0b0f]" />
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold">
                    Tư vấn miễn phí
                  </h3>
                  <p className="hidden text-[13px] md:block">
                    Đội ngũ tư vấn tận tình
                  </p>
                </div>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <CreditCard className="h-10 w-10 text-[#9d0b0f]" />
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold">
                    Thanh toán
                  </h3>
                  <p className="hidden text-[13px] md:block">
                    Thanh toán khi nhận hàng
                  </p>
                </div>
              </div>
            </div>

            {/* Quà tặng */}
            <div className="border-[0.5px] border-[#ded3c2] md:border-0">
              <div className="flex flex-col items-center justify-center gap-2.5 p-5 md:flex-row">
                <Gift className="h-10 w-10 text-[#9d0b0f]" />
                <div className="text-secondary-2">
                  <h3 className="text-sm text-center md:text-left md:text-base md:font-bold">
                    Giải pháp quà tặng
                  </h3>
                  <p className="hidden text-[13px] md:block">
                    Dành cho doanh nghiệp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SẢN PHẨM BÁN CHẠY */}
      <div className="px-4 mx-auto mt-10 text-center max-w-300">
        <SectionHeading title="Sản phẩm bán chạy" />

        <div className="grid items-stretch grid-cols-1 grid-rows-2 gap-5 mt-8 md:grid-cols-3">
          {/* CỘT 1 - TRÊN (Sản phẩm 0) */}
          <div className="relative h-full">
            <OrangeCard product={products[0]} />
          </div>

          {/* GIỮA – CHIẾM 2 HÀNG (Sản phẩm index 1) */}
          <div className="relative h-full row-span-2 group">
            {/* 4 góc trang trí - thêm pointer-events-none để không cản click */}
            <span className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-[#d4a373] z-10 pointer-events-none" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-[#d4a373] z-10 pointer-events-none" />
            <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-[#d4a373] z-10 pointer-events-none" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-[#d4a373] z-10 pointer-events-none" />

            {/* KHỐI NỘI DUNG CHÍNH (Đã bỏ thẻ div rỗng gây lỗi) */}
            <div
              onClick={() => navigate(`/product/${products[1]?.id}`)} // CLICK VÀO ĐÂY LÀ SANG TRANG CHI TIẾT
              className="bg-[#f39200] p-8 text-white flex flex-col items-center justify-center h-full shadow-md cursor-pointer hover:brightness-105 transition-all overflow-hidden"
            >
              <h3 className="mb-1 text-xl font-bold tracking-tight uppercase">
                {products[1]?.name}
              </h3>
              <p className="mb-6 text-xs italic opacity-90">
                {products[1]?.slogan}
              </p>

              <img
                src={products[1]?.image}
                className="object-contain w-56 h-56 mb-8 transition-transform duration-500 drop-shadow-2xl group-hover:scale-110"
                alt=""
              />

              <p className="mb-1 text-xs font-medium">Chỉ từ</p>
              <p className="mb-6 text-3xl italic font-black">55.000đ</p>

              {/* NÚT MUA NGAY (Dẫn sang thanh toán) */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // QUAN TRỌNG: Để khi bấm nút không bị nhảy vào trang chi tiết của thẻ cha
                  addToCart(products[1]);
                  navigate(`/product/${products[1]?.id}`); // MUA NGAY LÀ SANG THANH TOÁN
                }}
                className="border-2 border-white px-8 py-2 rounded-full text-xs font-bold uppercase hover:bg-white hover:text-[#f39200] transition-all active:scale-95 shadow-lg relative z-20"
              >
                Mua ngay
              </button>
            </div>
          </div>

          {/* CỘT 3 - TRÊN (Sản phẩm 2) */}
          <div className="relative h-full">
            <OrangeCard product={products[2]} />
          </div>

          {/* CỘT 1 - DƯỚI (Sản phẩm 3) */}
          <div className="relative h-full">
            <OrangeCard product={products[3]} />
          </div>

          {/* CỘT 3 - DƯỚI (Sản phẩm 4 hoặc lấy lại 0) */}
          <div className="relative h-full">
            <OrangeCard product={products[4] || products[0]} />
          </div>
        </div>
      </div>

      {/* SECTION 4: GIẢI PHÁP QUÀ TẶNG */}
      <div className="px-4 mx-auto mt-20 text-center max-w-300">
        <SectionHeading title="Giải pháp quà tặng, quà biếu" />
        <p className="text-secondary-2 my-5 hidden px-[12%] text-center text-base lg:block text-gray-600 font-medium leading-relaxed italic">
          Bộ quà tặng Hồng Lam là giải pháp quà Tết, quà Trung Thu, quà lễ
          Tết,.. được lựa chọn để kết nối các mối quan hệ xã hội.
        </p>
        <div className="grid grid-cols-1 gap-8 mt-10 md:grid-cols-3">
          <GiftCard
            id={158} // Thêm ID ở đây
            title="Bộ quà Sắc Hoa"
            price="605K"
            img="https://cdn.honglam.vn/honglam/Sac_Hoa_1_06cf1c5837.jpg"
          />
          <GiftCard
            id={155} // Thêm ID ở đây
            title="Bộ quà Thịnh Vượng VIP"
            price="1.465.000"
            img="https://cdn.honglam.vn/honglam/Thinh_Vuong_1_80577e5604.jpg"
          />
          <GiftCard
            id={156} // Thêm ID ở đây
            title="Bộ quà An Khang VIP"
            price="1.215.000"
            img="https://cdn.honglam.vn/honglam/An_Khang_1_f0039c4d01.jpg"
          />
        </div>
        {/* ... nút Xem tất cả sản phẩm giữ nguyên ... */}
        <div className="flex justify-center mt-8">
          <Link
            to="/category/giai-phap-qua-tang"
            className="hover:text-[#9d0b0f] group inline-flex items-center gap-2 text-base text-[#917359] font-bold transition-all underline-offset-4"
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

      {/* SECTION 5: Ô MAI (XÍ MUỘI) */}
      <div className="px-4 mx-auto mt-20 text-center max-w-300">
        <SectionHeading title="Ô mai (xí muội)" />
        <p className="text-[#88694f] my-5 text-center text-base font-medium">
          Ô mai xí muội đặc sản Hà Nội
        </p>

        <div className="flex items-start h-auto gap-4 mt-8">
          {/* Ảnh lớn bên trái - Có viền trắng bao quanh bên trong */}
          <div
            className="relative hidden h-full md:block shrink-0"
            style={{ width: "363px" }}
          >
            <div className="absolute border border-white top-1 right-1 bottom-1 left-1 z-2 opacity-60"></div>
            <img
              src="https://cdn.honglam.vn/honglam/HL_5_04_1_91ecb38969.jpg"
              className="relative z-1 h-90.75 w-full object-cover"
              alt="Ô mai xí muội banner"
            />
          </div>

          {/* Phần danh sách sản phẩm bên phải (Carousel/Grid) */}
          <div className="relative flex-1">
            {/* Nút điều hướng Trái */}
            <div
              onClick={prevSlide}
              className="absolute w-8 h-8 -translate-y-1/2 cursor-pointer top-1/2 -left-4 z-3"
            >
              <img
                alt="prev"
                src="https://honglam.vn/_next/static/media/slick-prev-xs-hover.d0444fb5.png"
                className="object-cover w-8 h-8"
              />
            </div>

            {/* Nút điều hướng Phải */}
            <div
              onClick={nextSlide}
              className="absolute w-8 h-8 -translate-y-1/2 cursor-pointer top-1/2 -right-4 z-3"
            >
              <img
                alt="next"
                src="https://honglam.vn/_next/static/media/slick-next-xs-hover.c14e777f.png"
                className="object-cover w-8 h-8"
              />
            </div>

            {/* Grid sản phẩm */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${slideIndex * 100}%)`,
                }}
              >
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <div
                    key={i}
                    className="grid min-w-full grid-cols-2 gap-4 px-1 lg:grid-cols-3"
                  >
                    {products
                      .slice(
                        i * ITEMS_PER_SLIDE,
                        i * ITEMS_PER_SLIDE + ITEMS_PER_SLIDE,
                      )
                      .map((p) => (
                        <ProductItemSmall key={p.id} product={p} />
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots (Dạng ảnh như element bạn check) */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button key={i} onClick={() => setSlideIndex(i)}>
                  <img
                    src={
                      slideIndex === i
                        ? "https://honglam.vn/_next/static/media/slick-dot-active.e0c701e2.png"
                        : "https://honglam.vn/_next/static/media/slick-dot.1e11291d.png"
                    }
                    className="w-3.5"
                    alt=""
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Link Xem tất cả sản phẩm */}
        <div className="flex justify-center mt-8">
          <Link
            to="/category/o-mai"
            className="hover:text-[#9d0b0f] group inline-flex items-center gap-2 text-base text-[#917359] font-bold transition-all underline-offset-4"
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

      {/* SECTION 6: TẠP CHÍ  */}
      <div className="px-4 mx-auto mt-20 max-w-300">
        {/* HEADER */}
        <div className="relative flex items-center justify-center md:justify-start">
          <SectionHeading title="Tạp chí " />

          <div className="flex-1 hidden h-px -ml-1 bg-primary z-1 md:block"></div>

          <a
            href="/tap-chi-hong-lam"
            className="hidden text-primary text-nowrap md:block"
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
                Nhìn lại sự kiện ra mắt bộ sưu tập quà Tết 2026 “Mã đáo khai
                xuân”
              </a>

              <div className="mt-2 text-sm text-secondary-2 line-clamp-3">
                Ngày 14/12 vừa qua, tại không gian cửa hàng Ô mai Hồng Lam Lạc
                Long Quân, sự kiện ra mắt bộ sưu tập quà Tết 2026 đã diễn ra
                trong không khí ấm cúng, gần gũi…
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
                Hồng Lam chung tay hỗ trợ Trường Mầm non Kim Lư (Thái Nguyên)
              </a>

              <div className="mt-2 text-sm text-secondary-2 line-clamp-3">
                Sau đợt mưa lũ kéo dài tại miền núi phía Bắc, Hồng Lam đã tổ
                chức hoạt động thiện nguyện nhằm hỗ trợ thầy cô và học sinh…
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: THƯ VIỆN VIDEO */}
      <div className="px-4 mx-auto mt-20 max-w-300">
        {/* Header */}
        <div className="relative flex items-center justify-center md:justify-start">
          <SectionHeading title="Thư viện Video" />

          <div className="flex-1 hidden h-px -ml-1 bg-primary z-1 md:block"></div>

          <a href="/video" className="hidden text-primary text-nowrap md:block">
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
                {
                  title: '[ Trailer] Cuộc thi làm clip "Ơn thầy nghĩa bạn"',
                  link: "/trailer-cuoc-thi-lam-clip-on-thay-nghia-ban-o-mai-hong-lam",
                  img: "https://cdn.honglam.vn/honglam/hqdefault_4957fa2598.jpg",
                },
                {
                  title:
                    'Ô mai Click Go - Chương trình "Lửa thử vàng" - VTVCab15',
                  link: "/o-mai-hong-lam-chuong-trinh-lua-thu-vang-vtvcab15",
                  img: "https://cdn.honglam.vn/honglam/hqdefault_b09821392c.jpg",
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
    <div className="text-[#9d0b0f] uppercase text-[11px] font-bold text-left leading-tight">
      {text}
    </div>
  </div>
);

const newLocal =
  "absolute -top-px -left-3 h-[calc(100%+2px)] w-[14px] object-contain";

const SectionHeading = ({ title }) => (
  <div className="relative flex items-center justify-center my-10 z-1">
    <div className="absolute top-1/2 left-0 w-full h-px bg-[#9d0b0f] z-1"></div>
    <div className="border-[#9d0b0f] relative z-2 flex w-fit items-center border-t border-b p-px bg-[#f7f4ef]">
      <img
        alt="left"
        src="https://honglam.vn/_next/static/media/btn47-bg-left-hover-solid.5a0f365f.png"
        className={newLocal}
      />
      <div className="bg-[#9d0b0f] px-6 py-2 flex items-center justify-center min-w-50 md:min-w-77.5">
        <h3 className="text-xl md:text-2xl lg:text-[30px] font-bold text-white uppercase tracking-tighter">
          {title}
        </h3>
      </div>
      <img
        alt="right"
        src="https://honglam.vn/_next/static/media/btn47-bg-right-hover-solid.81fa6bf3.png"
        className="absolute -top-px -right-3 h-[calc(100%+2px)] w-3.5 object-contain"
      />
    </div>
  </div>
);

const OrangeCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-[#f39200] p-4 text-white flex items-center justify-between shadow-sm hover:translate-x-1 transition-all cursor-pointer group h-full relative"
    >
      <span className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-[#d4a373]" />
      {/* ... giữ nguyên 3 góc còn lại ... */}

      <div className="flex-1 text-left">
        <h3 className="font-bold text-sm mb-0.5 line-clamp-1">
          {product?.name}
        </h3>
        {/* ... giữ nguyên slogan, giá ... */}
        <button className="border border-white px-4 py-1 rounded-full text-[9px] font-bold uppercase group-hover:bg-white group-hover:text-[#f39200]">
          Mua ngay
        </button>
      </div>
      <img
        src={product?.image}
        className="object-contain w-24 h-24 transition-transform drop-shadow-md group-hover:rotate-6"
      />
    </div>
  );
};

const GiftCard = ({ id, title, price, img }) => {
  // Nhận thêm id
  const navigate = useNavigate();
  const { addToCart } = useCart();

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
          className="relative flex w-fit items-center border-t border-b border-[#faa519] p-px bg-white 
                        before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-[#faa519]
                        after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-[#faa519]"
        >
          <img
            alt="left"
            src="https://honglam.vn/_next/static/media/btn47-bg-left-hover-solid.5a0f365f.png"
            className="absolute -top-px -left-3 h-[calc(100%+2px)] w-3.5 object-contain"
            style={{ filter: "hue-rotate(38deg) brightness(1.2) saturate(2)" }}
          />
          <div className="bg-[#faa519] flex items-center justify-center">
            <h3 className="h-10 px-6 text-sm md:text-base font-bold text-[#9d0b0f] flex items-center uppercase tracking-tighter whitespace-nowrap">
              {title}
            </h3>
          </div>
          <img
            alt="right"
            src="https://honglam.vn/_next/static/media/btn47-bg-right-hover-solid.81fa6bf3.png"
            className="absolute -top-px -right-3 h-[calc(100%+2px)] w-3.5 object-contain"
            style={{ filter: "hue-rotate(38deg) brightness(1.2) saturate(2)" }}
          />
        </div>
      </div>

      {/* ẢNH SẢN PHẨM: Thêm Link để click vào ảnh là chuyển trang */}
      <Link
        to={`/product/${id}`}
        className="block mt-4 overflow-hidden bg-white"
      >
        <img
          src={img}
          className="object-cover w-full transition-transform duration-500 h-80 group-hover:scale-105"
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
          Chỉ từ {price}
        </p>

        {/* NÚT BẤM: Sửa thành điều hướng sang trang chi tiết */}
        <button
          onClick={() => navigate(`/product/${id}`)}
          className="flex items-center gap-1 bg-white text-[#9d0b0f] border border-[#9d0b0f] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase hover:bg-[#9d0b0f] hover:text-white transition-all shadow-sm active:scale-95"
        >
          Mua ngay <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

const ProductItemSmall = ({ product }) => {
  const { addToCart } = useCart();
  return (
    <div className="h-full bg-white p-1 text-center shadow-[0_3px_10px_rgba(0,0,0,.04)] transition-all flex flex-col group border hover:border-[#faa51980]">
      {/* Bọc toàn bộ bằng Link */}
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        <div className="h-40 overflow-hidden lg:h-60">
          <img
            src={product.image}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="flex flex-col items-center flex-1 p-3">
          <h3 className="text-base font-bold text-gray-800 transition-colors line-clamp-1 group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mb-4 text-[13px] text-[#88694f] italic">
            {product.slogan}
          </p>
          <p className="mt-auto mb-3 font-bold text-primary">
            {product.price.toLocaleString()}đ
          </p>
          <div className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold border border-gray-200 shadow-sm rounded-[20px] px-[25px] py-1.5 text-primary hover:bg-primary hover:text-white transition-all">
            Mua nhanh
          </div>
        </div>
      </Link>
    </div>
  );
};
export default Home;
