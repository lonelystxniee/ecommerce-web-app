import { useState, useEffect } from "react";
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
  Headset,
  CreditCard,
  ChevronDown,
  Monitor,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CategoryDropdown } from "./CategoryDropdown";

const bannerImages = [
  "https://cdn.honglam.vn/honglam/Tet_website_ab5d5cb5d1.jpg",
  "https://cdn.honglam.vn/honglam/HL_5_04_1_91ecb38969.jpg",
  "https://cdn.honglam.vn/honglam/Sac_Hoa_1_06cf1c5837.jpg",
];

const Hero = ({ categories }) => {
  const sliderImages = [
    bannerImages[bannerImages.length - 1],
    ...bannerImages,
    bannerImages[0],
  ];

  const [bannerIndex, setBannerIndex] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true);

  const nextBanner = () => {
    setBannerIndex((prev) => prev + 1);
  };

  const prevBanner = () => {
    setBannerIndex((prev) => prev - 1);
  };

  useEffect(() => {
    if (bannerIndex === bannerImages.length + 1) {
      setTimeout(() => {
        setEnableTransition(false);
        setBannerIndex(1);
      }, 500);
    } else if (bannerIndex === 0) {
      setTimeout(() => {
        setEnableTransition(false);
        setBannerIndex(bannerImages.length);
      }, 500);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnableTransition(true);
    }
  }, [bannerIndex]);

  useEffect(() => {
    const timer = setInterval(nextBanner, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* SECTION 1: HERO (Sidebar + Banner) */}
      <section className="px-4 pt-4 mx-auto max-w-300">
        <div className="flex flex-col gap-3 md:flex-row h-90">
          <div className="hidden h-full md:block w-65">
            <div className="relative h-full bg-primary text-white shadow-lg p-1.5">
              <img
                src="https://honglam.vn/_next/static/media/bg-product-menu.5933dd2d.png"
                alt=""
                className="absolute inset-2 w-[calc(100%-12px)] h-[calc(100%-15px)] z-1"
              />
              {/* Nội dung */}
              <div className="flex flex-col h-full pb-2 bg-primary">
                {/* Header */}
                <div className="flex items-center gap-2 px-4 border-b border-[#b30e0e] h-11 shrink-0 text-[15px]">
                  <Menu className="w-4 h-4" />
                  <span>Danh mục sản phẩm</span>
                </div>

                {/* Menu */}
                <MenuItem categories={categories} />
              </div>
            </div>
          </div>

          {/* Category Dropdown */}
          <CategoryDropdown categories={categories} />

          {/* BANNER */}
          <div className="flex-1 h-1/2 md:h-full">
            <div className="relative h-full">
              {/* SLIDER */}
              <div className="relative h-full overflow-hidden">
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
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>

                <img
                  src="https://honglam.vn/_next/static/media/bg-slider.afd7d5c3.png"
                  alt=""
                  className="absolute inset-0 z-10 w-full h-full pointer-events-none"
                />
              </div>

              {/* NEXT BUTTON */}
              <button
                onClick={nextBanner}
                className="absolute z-20 p-1 transition -translate-y-1/2 rounded-full cursor-pointer -right-4 top-1/2"
              >
                <img
                  alt="next"
                  src="https://honglam.vn/_next/static/media/btn-slider-next.50159872.png"
                  className="object-cover w-6 h-6"
                />
              </button>
              {/* PREV BUTTON */}
              <button
                onClick={prevBanner}
                className="absolute z-20 p-1 transition -translate-y-1/2 rounded-full cursor-pointer -left-4 top-1/2 "
              >
                <img
                  alt="next"
                  src="https://honglam.vn/_next/static/media/btn-slider-prev.9e054105.png"
                  className="object-cover w-6 h-6"
                />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const MenuItem = ({ categories }) => {
  const getIcon = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("tươi") || n.includes("sống"))
      return <Clock className="w-4 h-4" />;
    if (n.includes("nhu yếu") || n.includes("thiết yếu"))
      return <Package className="w-4 h-4" />;
    if (n.includes("bánh mì") || n.includes("bơ sữa"))
      return <Sparkles className="w-4 h-4" />;
    if (n.includes("ăn nhẹ") || n.includes("bánh kẹo"))
      return <Gift className="w-4 h-4" />;
    if (n.includes("đồ uống") || n.includes("giải khát"))
      return <Cake className="w-4 h-4" />;
    if (n.includes("gia vị")) return <Coffee className="w-4 h-4" />;
    if (n.includes("điện tử")) return <Monitor className="w-4 h-4" />;
    return <ShoppingBag className="w-4 h-4" />;
  };

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

  return (
    <div className="relative flex-1 text-white z-1 overflow-y-auto max-h-[calc(100%-44px)] custom-scrollbar">
      {categories && categories.length > 0 ? (
        categories.map((cat, index) => (
          <Link
            key={cat._id}
            to={`/category/${getSlug(cat.name)}`}
            className={`flex h-11 items-center gap-2 px-4 border-b border-[#b30e0e] hover:bg-[rgba(0,0,0,.15)] cursor-pointer text-[15px] ${index === categories.length - 1 ? "border-b-0" : ""}`}
          >
            {getIcon(cat.name)}
            <span className="text-sm truncate">{cat.name}</span>
          </Link>
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-xs opacity-50">
          Đang tải danh mục...
        </div>
      )}
    </div>
  );
};

export default Hero;
