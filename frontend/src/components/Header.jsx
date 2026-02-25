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
} from "lucide-react";
import { useCart } from "../context/CartContext";
import AuthForm from "./AuthForm";

const Header = () => {
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // QUAN TRỌNG: Tạo 2 Ref riêng biệt cho 2 Header
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

  // Sửa lỗi Click Outside: Kiểm tra cả 2 Ref
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
            {/* Logo Section */}
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
                dropdownRef={mainDropdownRef} // Ref cho header chính
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* --- STICKY HEADER (KHI CUỘN XUỐNG) --- */}
      <div
        className={`fixed top-0 left-0 w-full bg-white shadow-md z-[100] transition-all duration-500 transform ${
          isScrolled
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-[1200px] px-4 py-2 flex items-center gap-6">
          <div className="bg-[#9d0b0f] text-white flex h-11 items-center gap-2 px-4 cursor-pointer">
            <Menu size={20} />
            <span className="font-bold uppercase text-xs">Danh mục</span>
          </div>
          <div className="flex-1">
            <SearchBar sticky />
          </div>
          <AuthAndCart
            totalItems={totalItems}
            user={user}
            onAuthClick={() => setIsAuthOpen(true)}
            isDropdownOpen={isUserDropdownOpen}
            setIsDropdownOpen={setIsUserDropdownOpen}
            dropdownRef={stickyDropdownRef} // Ref cho header sticky
            onLogout={handleLogout}
          />
        </div>
      </div>

      <AuthForm isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

// --- Sub-components ---

const SearchBar = ({ sticky }) => (
  <form
    className={`${sticky ? "flex" : "hidden lg:flex"} flex-1 relative group`}
  >
    <div className="search border-[#faa519] flex flex-1 border px-[1px] py-[1px] bg-white rounded-sm overflow-hidden">
      <input
        type="text"
        placeholder="Từ khóa tìm kiếm..."
        className="flex-1 h-9 px-4 text-sm outline-none"
      />
      <button className="bg-[#faa519] text-[#9d0b0f] px-5 py-2 text-xs font-bold flex items-center gap-2">
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
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={user ? () => setIsDropdownOpen(!isDropdownOpen) : onAuthClick}
        className="flex items-center gap-2 group text-[#9d0b0f] cursor-pointer"
      >
        <div className="border-[#faa519] rounded-full border-2 p-1.5 group-hover:bg-[#faa519] transition-all">
          <UserRound size={20} className="group-hover:text-white" />
        </div>
        <div className="leading-tight hidden lg:block">
          {user ? (
            <>
              <span className="text-[11px] font-bold block">
                {user.full_name || user.fullName || "Tài khoản"}
              </span>
              <p className="flex items-center text-[10px] font-medium text-[#795e2f]">
                Tài khoản{" "}
                <ChevronDown
                  size={10}
                  className={`ml-1 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </p>
            </>
          ) : (
            <>
              <span className="text-[11px] font-bold block">
                Đăng kí & Đăng nhập
              </span>
              <p className="flex items-center text-[10px] font-medium text-[#795e2f]">
                Tài khoản <ChevronDown size={10} />
              </p>
            </>
          )}
        </div>
      </div>

      {/* DROPDOWN MENU */}
      {user && isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-[110]">
          {/* QUAN TRỌNG: Thêm onClick={() => setIsDropdownOpen(false)} vào các Link */}
          <Link
            to="/account?tab=info"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5c4033] hover:bg-[#f7f4ef]"
          >
            <User size={18} className="text-[#9d0b0f]" /> Thông tin tài khoản
          </Link>
          <Link
            to="/account?tab=orders"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5c4033] hover:bg-[#f7f4ef]"
          >
            <Package size={18} className="text-[#9d0b0f]" /> Quản lý đơn hàng
          </Link>
          <Link
            to="/account?tab=favorites"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5c4033] hover:bg-[#f7f4ef]"
          >
            <Heart size={18} className="text-[#9d0b0f]" /> Sản phẩm yêu thích
          </Link>
          <hr className="my-1 border-gray-100" />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#9d0b0f] hover:bg-[#f7f4ef] font-semibold"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      )}
    </div>

    <Link to="/cart" className="relative group text-[#9d0b0f]">
      <div className="border-[#faa519] rounded-full border-2 p-1.5 group-hover:bg-[#faa519] transition-all">
        <ShoppingCart size={20} className="group-hover:text-white" />
      </div>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {totalItems}
        </span>
      )}
    </Link>
  </div>
);

export default Header;
