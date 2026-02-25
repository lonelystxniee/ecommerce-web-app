import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  User,
  Package,
  Heart,
  LogOut,
  ChevronRight,
  Home,
  Camera,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const AccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // LẤY TAB TRỰC TIẾP TỪ URL
  const activeTab = searchParams.get("tab") || "info";

  // XỬ LÝ LẤY USER AN TOÀN - Tránh lỗi trắng trang
  const user = useMemo(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error("Lỗi đọc dữ liệu user:", error);
    }
    // Trả về object mặc định nếu không có dữ liệu để không bị crash
    return {
      fullName: "Khách hàng",
      email: "",
      phone: "",
      gender: "Nam",
      birthday: "",
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const changeTab = (tabName) => {
    navigate(`/account?tab=${tabName}`);
  };

  return (
    <div
      className="min-h-screen bg-[#f2ebe3] font-sans pt-5 pb-20"
      style={{
        backgroundImage: `url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')`,
      }}
    >
      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4 mb-6 flex items-center gap-2 text-sm text-gray-600">
        <Link to="/" className="flex items-center gap-1 hover:text-[#800a0d]">
          <Home size={14} /> Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-[#800a0d]">Quản lý tài khoản</span>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* --- SIDEBAR BÊN TRÁI --- */}
        <div className="w-full md:w-[280px] shrink-0">
          <div className="bg-white/50 border border-[#800a0d]/30 rounded-sm overflow-hidden shadow-sm">
            <div className="bg-[#813a0d] text-white p-4">
              <h2 className="text-xl font-bold uppercase tracking-wider text-center">
                Tài khoản
              </h2>
            </div>

            <nav className="flex flex-col">
              <SidebarItem
                icon={<User size={18} />}
                text="Thông tin tài khoản"
                active={activeTab === "info"}
                onClick={() => changeTab("info")}
              />
              <SidebarItem
                icon={<Package size={18} />}
                text="Quản lý đơn hàng"
                active={activeTab === "orders"}
                onClick={() => changeTab("orders")}
              />
              <SidebarItem
                icon={<Heart size={18} />}
                text="Sản phẩm yêu thích"
                active={activeTab === "favorites"}
                onClick={() => changeTab("favorites")}
              />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 text-[#5c4033] hover:bg-[#800a0d]/10 transition-all border-t border-gray-200"
              >
                <LogOut size={18} />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </nav>
          </div>
        </div>

        {/* --- NỘI DUNG BÊN PHẢI --- */}
        <div className="flex-1">
          {activeTab === "info" && <PersonalInfo user={user} />}
          {activeTab === "orders" && <OrderManagement />}
          {activeTab === "favorites" && <FavoriteProducts />}
        </div>
      </div>
    </div>
  );
};

// Component con SidebarItem
const SidebarItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 transition-all border-b border-gray-100 last:border-none
      ${active ? "bg-[#800a0d] text-white" : "text-[#5c4033] hover:bg-[#800a0d]/5"}`}
  >
    {icon}
    <span className={`font-medium ${active ? "font-bold" : ""}`}>{text}</span>
  </button>
);

// 1. Tab Thông tin cá nhân
const PersonalInfo = ({ user }) => {
  const displayName = user.fullName || user.full_name || "Khách hàng";
  const fileInputRef = useRef(null);

  // Lấy avatar từ localStorage nếu có, nếu không để null
  const [avatar, setAvatar] = useState(user.avatar || null);

  // Hàm xử lý khi chọn file ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng (chỉ nhận ảnh)
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file hình ảnh!");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatar(base64String); // Hiển thị ảnh preview

        // Lưu vào localStorage để đồng bộ với các phần khác
        const updatedUser = { ...user, avatar: base64String };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Thông báo (tùy chọn)
        console.log("Đã cập nhật ảnh đại diện tạm thời");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-[#800a0d] mb-8 border-b-2 border-[#800a0d] inline-block pb-1">
        Thông tin cá nhân
      </h2>

      <div className="flex flex-col lg:flex-row gap-10 bg-white/40 p-8 rounded-xl border border-white/60 backdrop-blur-sm">
        {/* KHU VỰC AVATAR */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-pink-100 border-4 border-white flex items-center justify-center text-[#800a0d] text-3xl font-bold shadow-md overflow-hidden">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Nút bấm thay đổi ảnh */}
            <button
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-[#800a0d] text-white p-2 rounded-full border-2 border-white shadow-lg hover:bg-[#60080a] transition-all transform hover:scale-110"
              title="Thay đổi ảnh đại diện"
            >
              <Camera size={18} />
            </button>

            {/* Input file ẩn */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="text-[11px] text-[#800a0d] font-bold uppercase tracking-wider">
            Ảnh đại diện
          </p>
        </div>

        {/* Form Fields (Giữ nguyên phần này của bạn) */}
        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#5c4033] mb-2 uppercase">
              Họ và tên
            </label>
            <input
              type="text"
              defaultValue={displayName}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-[#800a0d] outline-none bg-white/80"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#5c4033] mb-2 uppercase">
                Email
              </label>
              <input
                type="email"
                defaultValue={user.email || ""}
                className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5c4033] mb-2 uppercase">
                Điện thoại
              </label>
              <input
                type="text"
                defaultValue={user.phone || ""}
                className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                disabled
              />
            </div>
          </div>

          <div className="pt-4">
            <button className="bg-[#800a0d] text-white px-8 py-3 rounded-md font-bold hover:bg-[#60080a] transition-all shadow-lg active:scale-95">
              CẬP NHẬT THÔNG TIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Tab Quản lý đơn hàng
const OrderManagement = () => (
  <div className="animate-fadeIn">
    <h2 className="text-2xl font-bold text-[#800a0d] mb-8 border-b-2 border-[#800a0d] inline-block pb-1">
      Quản lý đơn hàng
    </h2>
    <div className="bg-white/40 rounded-xl border border-white/60 backdrop-blur-sm p-10 text-center text-gray-500 italic">
      Bạn chưa có đơn hàng nào.
    </div>
  </div>
);

// 3. Tab Sản phẩm yêu thích
const FavoriteProducts = () => (
  <div className="animate-fadeIn">
    <h2 className="text-2xl font-bold text-[#800a0d] mb-8 border-b-2 border-[#800a0d] inline-block pb-1">
      Sản phẩm yêu thích
    </h2>
    <div className="p-10 bg-white/40 rounded-xl border border-white/60 text-center text-gray-500 italic">
      Chưa có sản phẩm yêu thích nào.
    </div>
  </div>
);

export default AccountPage;
