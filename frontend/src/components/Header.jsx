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
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";

import { useCart } from "../context/CartContext";
import AuthForm from "./AuthForm";
import SearchBar from "./SearchBar";
import { CategoryDropdown } from "../pages/Home/CategoryDropdown";

const Header = () => {
  const { totalItems } = useCart();
  const [categories, setCategories] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const mainDropdownRef = useRef(null);
  const stickyDropdownRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/category`);
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          resolve();
        }, 1000);
      }),
      {
        loading: "Đang đăng xuất...",
        success: "Đã đăng xuất thành công!",
        error: "Có lỗi xảy ra!",
      },
    );
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <>
      {/* --- HEADER CHÍNH (Ở TRÊN ĐẦU) --- */}
      <header className="z-50 flex flex-col w-full px-5 bg-transparent ">
        <div className="mx-auto max-w-300 w-full flex gap-2.5">
          <div className="relative flex justify-center p-4 md:w-60 shrink-0">
            {/* Logo Section */}
            <div className="relative w-34 md:w-40 h-22.5 shrink-0 overflow-visible">
              <Link
                to="/"
                className="absolute inset-0 z-10 flex flex-col items-center justify-center"
              >
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="object-cover h-full w-50"
                />
                <p className="absolute text-sm font-bold text-transparent md:text-base whitespace-nowrap bottom-2 bg-linear-to-r from-primary to-secondary bg-clip-text">
                  Trao niềm tin, nhận tài lộc
                </p>
              </Link>
            </div>
            <img
              alt="Logo banner"
              className="absolute top-0 object-cover w-auto -translate-x-1/2 pointer-events-none left-1/2 h-45 max-w-max z-1"
              src="https://honglam.vn/_next/static/media/bg-logo.953e94d2.png"
            />
          </div>

          <div className="flex flex-col justify-start flex-1 pt-2">
            <div className="flex items-center justify-end gap-6 py-4">
              <div className="flex items-center gap-1 font-bold text-primary">
                <Phone size={14} className="text-white fill-primary" />
                <span className="text-sm">Giao hàng tận nơi: 19008122</span>
              </div>
            </div>

            <div className="flex items-center w-full gap-4">
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

      <div
        className={`fixed top-0 left-0 w-full bg-white shadow-md z-100 transition-all duration-500 transform bg-[url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')] ${isScrolled
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
          }`}
      >
        <div className="flex items-center gap-6 px-4 py-2 mx-auto max-w-300">
          <div className="flex-1 w-full">
            <CategoryDropdown display categories={categories} />
          </div>
          <div className="hidden flex-2 lg:block">
            <SearchBar />
          </div>
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


const AuthAndCart = ({
  totalItems,
  user,
  onAuthClick,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
  onLogout,
}) => (
  <div className="flex items-center justify-end gap-4 ml-auto">
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={user ? () => setIsDropdownOpen(!isDropdownOpen) : onAuthClick}
        className="flex items-center gap-2 cursor-pointer group text-primary"
      >
        <div className="border-secondary rounded-full border-2 p-1.5 group-hover:bg-secondary transition-all">
          <UserRound size={20} className="group-hover:text-white" />
        </div>
        <div className="hidden leading-tight md:block">
          {user ? (
            <>
              <span className="block text-sm font-bold">
                {user.full_name || user.fullName || "Tài khoản"}
              </span>
              <p className="flex items-center text-[11px] font-medium text-[#795e2f]">
                Tài khoản{" "}
                <ChevronDown
                  size={10}
                  className={`ml-1 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </p>
            </>
          ) : (
            <>
              <span className="block text-sm font-bold">
                Đăng kí & Đăng nhập
              </span>
              <p className="flex items-center text-[11px] font-medium text-[#795e2f]">
                Tài khoản <ChevronDown size={10} />
              </p>
            </>
          )}
        </div>
      </div>

      {/* DROPDOWN MENU */}
      {user && isDropdownOpen && (
        <div className="absolute right-0 w-56 py-2 mt-2 bg-[url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')] border border-gray-100 rounded-lg shadow-xl z-110">
          <Link
            to="/account?tab=info"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5c4033] hover:text-[#ce450a] group"
          >
            <User
              size={18}
              className="text-primary group-hover:text-[#ce450a]"
            />{" "}
            Thông tin tài khoản
          </Link>
          <Link
            to="/account?tab=orders"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5c4033] hover:text-[#ce450a]  group"
          >
            <Package
              size={18}
              className="text-primary group-hover:text-[#ce450a]"
            />{" "}
            Quản lý đơn hàng
          </Link>
          <Link
            to="/lucky-wheel"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#ce450a] animate-pulse group"
          >
            <Trophy
              size={18}
              className="text-[#faa519]"
            />{" "}
            Vòng quay may mắn
          </Link>
          <Link
            to="/account?tab=favorites"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5c4033] hover:text-[#ce450a] group"
          >
            <Heart
              size={18}
              className="text-primary group-hover:text-[#ce450a]"
            />{" "}
            Sản phẩm yêu thích
          </Link>
          <hr className="my-1 border-gray-100" />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary group hover:text-[#ce450a] font-semibold cursor-pointer"
          >
            <LogOut size={18} className="group-hover:text-[#ce450a]" /> Đăng
            xuất
          </button>
        </div>
      )}
    </div>

    <Link to="/cart" className="relative group text-primary">
      <div className="border-secondary rounded-full border-2 p-1.5 group-hover:bg-secondary transition-all">
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
