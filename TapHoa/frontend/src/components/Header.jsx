import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  UserRound,
  Phone,
  ChevronDown,
  Menu,
  Package,
  User,
  Heart,
  LogOut,
  Clock,
  Sparkles,
  Gift,
  Cake,
  Coffee,
  Wine,
  Ticket,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import AuthForm from "./AuthForm";

const Header = () => {
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const mainDropdownRef = useRef(null);
  const stickyDropdownRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideMain =
        mainDropdownRef.current &&
        mainDropdownRef.current.contains(event.target);
      const isClickInsideSticky =
        stickyDropdownRef.current &&
        stickyDropdownRef.current.contains(event.target);

      if (!isClickInsideMain && !isClickInsideSticky) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsUserDropdownOpen(false);
    window.location.href = "/";
  };

  return (
    <>
      {/* --- HEADER CHÍNH (Ở TRÊN ĐẦU) --- */}
      <header className="hidden md:flex bg-[#f7f4ef] z-50 w-full flex-col border-b border-gray-100">
        <div className="mx-auto max-w-[1200px] w-full flex gap-2.5">
          <div className="relative flex w-[250px] justify-center p-4 shrink-0">
            <div className="relative w-[260px] h-[90px] shrink-0 overflow-visible">
              <Link
                to="/"
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-[210px] w-auto object-contain"
                />
              </Link>
            </div>
            <img
              alt="Logo banner"
              className="pointer-events-none absolute top-0 left-1/2 h-[180px] w-auto max-w-max -translate-x-1/2 object-cover z-[1]"
              src="https://honglam.vn/_next/static/media/bg-logo.953e94d2.png"
            />
          </div>

          <div className="flex-1 flex flex-col justify-start pt-2">
            <div className="flex items-center justify-end gap-6 py-4">
              <div className="text-[#9d0b0f] flex items-center gap-1 font-bold">
                <Phone size={14} className="fill-[#9d0b0f] text-white" />
                <span className="text-sm">Giao hàng tận nơi: 19008122</span>
              </div>
            </div>

            <div className="flex w-full items-center gap-4">
              <SearchBar />
              <AuthAndCart
                totalItems={totalItems}
                user={user}
                onAuthClick={() => setIsAuthOpen(true)}
                isDropdownOpen={isUserDropdownOpen}
                setIsDropdownOpen={setIsUserDropdownOpen}
                dropdownRef={mainDropdownRef}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* --- STICKY HEADER (KHI CUỘN XUỐNG) --- */}
      <div
        className={`fixed top-0 left-0 w-full bg-white shadow-lg z-[100] transition-all duration-500 transform ${
          isScrolled
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-[1200px] flex items-center h-16 gap-6 px-4">
          {/* 1. DANH MỤC SẢN PHẨM (BÊN TRÁI) */}
          <div className="relative group shrink-0">
            <div className="bg-[#9d0b0f] text-white flex h-10 items-center gap-2 px-4 rounded-sm cursor-pointer select-none">
              <Menu size={20} />
              <span className="font-bold uppercase text-[11px] whitespace-nowrap">
                Danh mục sản phẩm
              </span>
            </div>

            {/* DROPDOWN MENU */}
            <div className="absolute top-full left-0 w-[260px] bg-[#9d0b0f] text-white shadow-xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-[300]">
              <CategoryLinks />
            </div>
          </div>

          {/* 2. THANH TÌM KIẾM (Ở GIỮA) */}
          <div className="flex-1">
            <SearchBar sticky />
          </div>

          {/* 3. TÀI KHOẢN & GIỎ HÀNG (BÊN PHẢI) */}
          <AuthAndCart
            totalItems={totalItems}
            user={user}
            onAuthClick={() => setIsAuthOpen(true)}
            isDropdownOpen={isUserDropdownOpen}
            setIsDropdownOpen={setIsUserDropdownOpen}
            dropdownRef={stickyDropdownRef}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <AuthForm isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

// --- Sub-components để code sạch hơn ---

const CategoryLinks = () => (
  <>
    {[
      {
        to: "/category/giai-phap-qua-tang",
        icon: Clock,
        text: "Giải pháp quà tặng, quà biếu",
      },
      { to: "/category/o-mai", icon: Package, text: "Ô mai (xí muội)" },
      { to: "/category/mut-tet", icon: Sparkles, text: "Mứt Tết" },
      { to: "/category/banh-keo", icon: Gift, text: "Bánh - Kẹo" },
      { to: "/category/che-tra", icon: Cake, text: "Chè, Trà đặc sản" },
      { to: "/category/san-pham-khac", icon: Coffee, text: "Sản phẩm khác" },
      { to: "/category/thuc-uong", icon: Wine, text: "Thức uống" },
    ].map((item, idx) => (
      <Link
        key={idx}
        to={item.to}
        className="flex h-11 items-center gap-3 px-4 border-b border-[#a10c0d] hover:bg-[rgba(0,0,0,.15)] transition-colors text-sm"
      >
        <item.icon className="w-4 h-4" />
        <span>{item.text}</span>
      </Link>
    ))}
  </>
);

const SearchBar = ({ sticky }) => (
  <form
    className={`${sticky ? "flex" : "hidden lg:flex"} flex-1 relative group`}
  >
    <div className="flex flex-1 border-[#faa519] border bg-white rounded-sm overflow-hidden">
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm Hồng Lam..."
        className="flex-1 h-9 px-4 text-sm outline-none text-gray-700"
      />
      <button className="bg-[#faa519] text-[#9d0b0f] px-4 py-2 text-[11px] font-black flex items-center gap-2 whitespace-nowrap">
        <Search size={14} strokeWidth={3} /> TÌM KIẾM
      </button>
    </div>
  </form>
);

const AuthAndCart = ({
  totalItems,
  user,
  onAuthClick,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
  onLogout,
}) => (
  <div className="flex items-center gap-4 shrink-0">
    <Link
      to="/lucky-wheel"
      className="relative group text-[#9d0b0f] flex flex-col items-center"
    >
      <div className="border-[#faa519] rounded-full border-2 p-1.5 group-hover:bg-[#faa519] transition-all bg-white shadow-sm">
        <Ticket size={18} className="group-hover:text-white" />
      </div>
      <span className="text-[8px] font-bold uppercase mt-0.5 group-hover:text-[#faa519]">
        Săn Voucher
      </span>
    </Link>

    <div className="relative" ref={dropdownRef}>
      <div
        onClick={user ? () => setIsDropdownOpen(!isDropdownOpen) : onAuthClick}
        className="flex items-center gap-2 group text-[#9d0b0f] cursor-pointer"
      >
        <div className="border-[#faa519] rounded-full border-2 p-1.5 group-hover:bg-[#faa519] transition-all">
          <UserRound size={18} className="group-hover:text-white" />
        </div>
        <div className="leading-tight hidden xl:block">
          {user ? (
            <>
              <span className="text-[10px] font-bold block truncate max-w-[80px]">
                {user.fullName || "Tài khoản"}
              </span>
              <p className="flex items-center text-[10px] font-medium text-[#795e2f]">
                Tài khoản{" "}
                <ChevronDown
                  size={10}
                  className={`ml-0.5 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </p>
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold block">Đăng nhập</span>
              <p className="text-[10px] font-medium text-[#795e2f]">
                Tài khoản
              </p>
            </>
          )}
        </div>
      </div>

      {user && isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-52 bg-white rounded-md shadow-2xl border border-gray-100 py-2 z-[310] animate-fadeIn">
          <Link
            to="/account?tab=info"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f7f4ef]"
          >
            <User size={16} className="text-[#9d0b0f]" /> Thông tin cá nhân
          </Link>
          <Link
            to="/account?tab=orders"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f7f4ef]"
          >
            <Package size={16} className="text-[#9d0b0f]" /> Đơn hàng của tôi
          </Link>
          <hr className="my-1 border-gray-50" />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#9d0b0f] hover:bg-red-50 font-bold"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      )}
    </div>

    <Link to="/cart" className="relative group text-[#9d0b0f]">
      <div className="border-[#faa519] rounded-full border-2 p-1.5 group-hover:bg-[#faa519] transition-all">
        <ShoppingCart size={18} className="group-hover:text-white" />
      </div>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#9d0b0f] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
          {totalItems}
        </span>
      )}
    </Link>
  </div>
);

export default Header;
