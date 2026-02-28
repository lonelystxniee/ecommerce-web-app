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
import toast from "react-hot-toast";

const AccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get("tab") || "info";

  const user = useMemo(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error("Lỗi đọc dữ liệu user:", error);
    }
    return {
      fullName: "Khách hàng",
      email: "guest@example.com",
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

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

  const changeTab = (tabName) => {
    navigate(`/account?tab=${tabName}`);
  };

  return (
    <div className="h-auto pt-4 pb-20 bg-[url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-4 mx-auto mb-8 font-bold text-[#88694f] text-xs max-w-300">
        <Link to="/" className="hover:text-[#800a0d] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#800a0d]">Quản lý tài khoản</span>
      </div>

      <div className="flex flex-col items-start gap-10 px-4 mx-auto max-w-300 md:flex-row">
        {/* --- SIDEBAR --- */}
        <aside className="w-full md:w-80 shrink-0">
          <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl">
            {/* Profile Header in Sidebar */}
            <div className="bg-[#800a0d] p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')]"></div>
              <div className="relative z-10">
                <div className="inline-block p-1 mb-4 bg-white rounded-full shadow-lg">
                  <div className="w-20 h-20 rounded-full bg-[#fdfaf5] flex items-center justify-center text-[#800a0d] text-2xl font-black overflow-hidden border-2 border-[#800a0d]/10">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      user.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-white uppercase line-clamp-1">
                  {user.fullName}
                </h3>
                <p className="text-[11px] text-white/70 font-medium truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <nav className="p-3 bg-white">
              <div className="space-y-1">
                <SidebarItem
                  icon={<User size={18} />}
                  text="Thông tin tài khoản"
                  active={activeTab === "info"}
                  onClick={() => changeTab("info")}
                />
                <SidebarItem
                  icon={<Package size={18} />}
                  text="Lịch sử đơn hàng"
                  active={activeTab === "orders"}
                  onClick={() => changeTab("orders")}
                />
                <SidebarItem
                  icon={<Heart size={18} />}
                  text="Danh sách yêu thích"
                  active={activeTab === "favorites"}
                  onClick={() => changeTab("favorites")}
                />
              </div>

              <div className="pt-3 mt-3 border-t border-gray-50">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full gap-3 px-5 py-3.5 text-[#800a0d] hover:bg-red-50 transition-all rounded-xl font-bold text-sm"
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* --- CONTENT AREA --- */}
        <main className="flex-1 w-full min-h-150">
          <div className="transition-all duration-300">
            {activeTab === "info" && <PersonalInfo user={user} />}
            {activeTab === "orders" && <OrderManagement />}
            {activeTab === "favorites" && <FavoriteProducts />}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-5 py-3.5 transition-all duration-200 rounded-xl text-sm font-bold cursor-pointer
      ${
        active
          ? "bg-[#fdfaf5] text-[#800a0d] shadow-sm border border-[#800a0d]/10"
          : "text-text-primary hover:bg-gray-50 hover:pl-6"
      }`}
  >
    <span className={`${active ? "text-[#800a0d]" : "text-[#88694f]"}`}>
      {icon}
    </span>
    <span className="tracking-tight">{text}</span>
    {active && (
      <ChevronRight size={14} className="ml-auto opacity-50 text-[#800a0d]" />
    )}
  </button>
);

// 1. Tab Thông tin cá nhân
const PersonalInfo = ({ user }) => {
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatar(base64String);
        const updatedUser = { ...user, avatar: base64String };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Đã cập nhật ảnh đại diện!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-2xl animate-zoomIn rounded-3xl">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 border-dashed">
        <h2 className="text-2xl font-black text-[#800a0d]  tracking-tighter">
          Hồ sơ của tôi
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-[13px] font-bold text-[#88694f]  tracking-widest hover:text-[#800a0d] transition-colors cursor-pointer"
        >
          {isEditing ? "Hủy bỏ" : "Chỉnh sửa"}
        </button>
      </div>

      <div className="flex flex-col gap-12 lg:flex-row">
        {/* CỘT TRÁI: AVATAR NÂNG CẤP */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <div className="w-44 h-44 rounded-full p-1.5 border-2 border-dashed border-[#800a0d]/30 relative group">
              <div className="w-full h-full overflow-hidden bg-gray-50 rounded-full flex items-center justify-center text-[#800a0d] text-5xl font-black shadow-inner">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  user.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-full opacity-0 pointer-events-none bg-black/20 group-hover:opacity-100">
                <Camera className="text-white" size={32} />
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-2 right-2 bg-[#800a0d] text-white w-10 h-10 rounded-full border-4 border-white shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
            >
              <Camera size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="mt-4 text-[10px] font-black text-[#88694f] uppercase tracking-[0.2em]">
            Ảnh đại diện
          </p>
        </div>

        {/* CỘT PHẢI: FORM NÂNG CẤP */}
        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block pl-1 text-[13px] font-black text-text-primary">
                Họ và tên
              </label>
              <input
                type="text"
                disabled={!isEditing}
                defaultValue={user.fullName}
                className="w-full px-5 py-4 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-black text-text-primary block pl-1">
                Số điện thoại
              </label>
              <input
                type="text"
                disabled={!isEditing}
                defaultValue={user.phone || "Chưa cập nhật"}
                className="w-full px-5 py-4 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-text-primary block pl-1">
              Địa chỉ email
            </label>
            <input
              type="email"
              disabled
              defaultValue={user.email}
              className="w-full px-5 py-4 font-bold text-gray-400 border border-gray-100 cursor-not-allowed bg-gray-50 rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[13px] font-black text-text-primary block pl-1">
                Giới tính
              </label>
              <select
                disabled={!isEditing}
                className="w-full px-5 py-4 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714] appearance-none"
              >
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-black text-text-primary block pl-1">
                Ngày sinh
              </label>
              <input
                type="date"
                disabled={!isEditing}
                className="w-full px-5 py-4 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714]"
              />
            </div>
          </div>

          {isEditing && (
            <div className="pt-4">
              <button
                onClick={() => {
                  toast.success("Đã lưu thông tin mới!");
                  setIsEditing(false);
                }}
                className="bg-[#800a0d] cursor-pointer text-white px-10 py-3 rounded-[30px] font-black text-sm shadow-xl shadow-red-900/10 hover:rounded-sm transition-all active:scale-95 flex items-center gap-3"
              >
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 2. Tab Quản lý đơn hàng nâng cấp
const OrderManagement = () => (
  <div className="p-12 text-center bg-white border border-gray-100 shadow-2xl animate-zoomIn rounded-3xl">
    <div className="w-24 h-24 bg-[#fdfaf5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#800a0d]/20">
      <Package size={48} />
    </div>
    <h2 className="text-2xl font-bold text-[#3e2714] mb-2 tracking-tight">
      Lịch sử đơn hàng trống
    </h2>
    <p className="max-w-sm mx-auto mb-8 text-sm italic font-medium text-gray-500">
      Hình như bạn chưa có đơn hàng nào tại Hồng Lam. Hãy khám phá những sản
      phẩm quà tặng tinh hoa của chúng tôi nhé!
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 bg-[#800a0d] text-white px-8 py-3 rounded-[30px] font-bold text-sm tracking-widest hover:rounded-md shadow-lg transition-all active:scale-95"
    >
      <ShoppingBag size={16} />
      Tiếp tục mua sắm
    </Link>
  </div>
);

// 3. Tab Sản phẩm yêu thích nâng cấp
const FavoriteProducts = () => (
  <div className="p-12 text-center bg-white border border-gray-100 shadow-2xl animate-zoomIn rounded-3xl">
    <div className="w-24 h-24 bg-[#fdfaf5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#800a0d]/20">
      <Heart size={48} />
    </div>
    <h2 className="text-2xl font-bold text-[#3e2714] mb-2 tracking-tight">
      Sản phẩm yêu thích trống
    </h2>
    <p className="max-w-sm mx-auto mb-8 text-sm italic font-medium text-gray-500">
      Lưu lại những món quà bạn yêu thích để dễ dàng tìm lại và đặt hàng sau
      này.
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 border-2 border-[#800a0d] text-[#800a0d] px-8 py-3 rounded-[30px] font-bold text-sm tracking-widest hover:rounded-md transition-all active:scale-95"
    >
      Khám phá ngay
    </Link>
  </div>
);

const ShoppingBag = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export default AccountPage;
