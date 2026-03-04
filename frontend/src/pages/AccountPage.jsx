import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  User,
  Package,
  Heart,
  LogOut,
  ChevronRight,
  Home,
  Camera,
  Lock,
  History,
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
                <SidebarItem
                  icon={<Lock size={18} />}
                  text="Đổi mật khẩu"
                  active={activeTab === "password"}
                  onClick={() => changeTab("password")}
                />
                <SidebarItem
                  icon={<History size={18} />}
                  text="Lịch sử hoạt động"
                  active={activeTab === "activities"}
                  onClick={() => changeTab("activities")}
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
            {activeTab === "password" && <ChangePassword />}
            {activeTab === "activities" && <ActivityHistory />}
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
      ${active
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
const PersonalInfo = ({ user: initialUser }) => {
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(initialUser);
  const [avatar, setAvatar] = useState(initialUser.avatar || null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: initialUser.fullName || "",
    phone: initialUser.phone || "",
    gender: initialUser.gender || "Nam",
    birthday: initialUser.birthday ? initialUser.birthday.split("T")[0] : "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        toast.success("Cập nhật thông tin thành công!");
      } else {
        toast.error(data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      toast.error("Không thể kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setAvatar(base64String);

        // Auto-save avatar to backend
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/update-profile`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ avatar: base64String }),
            },
          );

          const data = await response.json();
          if (data.success) {
            const updatedUser = { ...user, avatar: base64String };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success("Đã cập nhật ảnh đại diện!");
          } else {
            toast.error("Không thể lưu ảnh đại diện lên server!");
          }
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          toast.error("Lỗi kết nối máy chủ khi lưu ảnh!");
        }
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
          onClick={() => {
            if (isEditing) {
              // Reset form data when canceling
              setFormData({
                fullName: user.fullName || "",
                phone: user.phone || "",
                gender: user.gender || "Nam",
                birthday: user.birthday ? user.birthday.split("T")[0] : "",
              });
            }
            setIsEditing(!isEditing);
          }}
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
                name="fullName"
                disabled={!isEditing}
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-5 py-2 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-black text-text-primary block pl-1">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                disabled={!isEditing}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Chưa cập nhật"
                className="w-full px-5 py-2 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714] disabled:opacity-60 disabled:cursor-not-allowed"
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
              value={user.email}
              className="w-full px-5 py-2 font-bold text-gray-400 border border-gray-100 cursor-not-allowed bg-gray-50 rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[13px] font-black text-text-primary block pl-1">
                Giới tính
              </label>
              <select
                name="gender"
                disabled={!isEditing}
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-5 py-2 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714] appearance-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-black text-text-primary block pl-1">
                Ngày sinh
              </label>
              <input
                type="date"
                name="birthday"
                disabled={!isEditing}
                value={formData.birthday}
                onChange={handleInputChange}
                className="w-full px-5 py-2 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714]"
              />
            </div>
          </div>

          {isEditing && (
            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="bg-[#800a0d] cursor-pointer text-white px-10 py-3 rounded-[30px] font-black text-sm shadow-xl shadow-red-900/10 hover:rounded-sm transition-all active:scale-95 flex items-center gap-3 disabled:opacity-70"
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
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

import { validateChangePassword } from "../helpers/validate";

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);

    // Validate on change
    const validationErrors = validateChangePassword(newData);
    setErrors(validationErrors);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const validationErrors = validateChangePassword(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Đổi mật khẩu thành công!");
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
      } else {
        toast.error(data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      toast.error("Không thể kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 mx-auto bg-white border border-gray-100 shadow-2xl  animate-zoomIn rounded-3xl">
      <div className="flex items-center gap-4 pb-6 mb-8 border-b border-gray-200 border-dashed">
        <div className="w-12 h-12 bg-[#fdfaf5] rounded-xl flex items-center justify-center text-[#800a0d] shadow-sm">
          <Lock size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#800a0d] tracking-tighter">
            Đổi mật khẩu
          </h2>
          <p className="text-xs font-medium text-gray-400">
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn
          </p>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-6">
        <div className="space-y-2">
          <label className="block pl-1 text-[13px] font-black text-text-primary">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            name="oldPassword"
            required
            value={formData.oldPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            className={`w-full px-5 py-2 bg-[#fdfaf5] border rounded-2xl outline-none focus:bg-white transition-all font-bold text-[#3e2714] ${errors.oldPassword ? "border-red-500" : "border-gray-100 focus:border-[#800a0d]"
              }`}
          />
          {errors.oldPassword && (
            <p className="pl-1 text-xs font-bold text-red-500">{errors.oldPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block pl-1 text-[13px] font-black text-text-primary">
            Mật khẩu mới
          </label>
          <input
            type="password"
            name="newPassword"
            required
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            className={`w-full px-5 py-2 bg-[#fdfaf5] border rounded-2xl outline-none focus:bg-white transition-all font-bold text-[#3e2714] ${errors.newPassword ? "border-red-500" : "border-gray-100 focus:border-[#800a0d]"
              }`}
          />
          {errors.newPassword && (
            <p className="pl-1 text-xs font-bold text-red-500">{errors.newPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block pl-1 text-[13px] font-black text-text-primary">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            className={`w-full px-5 py-2 bg-[#fdfaf5] border rounded-2xl outline-none focus:bg-white transition-all font-bold text-[#3e2714] ${errors.confirmPassword ? "border-red-500" : "border-gray-100 focus:border-[#800a0d]"
              }`}
          />
          {errors.confirmPassword && (
            <p className="pl-1 text-xs font-bold text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#800a0d] cursor-pointer text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-red-900/10 hover:rounded-lg transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </div>
      </form>
    </div>
  );
};

const ActivityHistory = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/activities`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          setActivities(data.activities);
        }
      } catch (error) {
        console.error("Lỗi lấy lịch sử hoạt động:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 bg-white shadow-2xl rounded-3xl animate-pulse">
        <RefreshCcw className="animate-spin text-[#800a0d] mb-2" size={32} />
        <span className="font-bold text-[#88694f]">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-2xl animate-zoomIn rounded-3xl">
      <div className="flex items-center gap-4 pb-6 mb-8 border-b border-gray-200 border-dashed">
        <div className="w-12 h-12 bg-[#fdfaf5] rounded-xl flex items-center justify-center text-[#800a0d] shadow-sm">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#800a0d] tracking-tighter">
            Lịch sử hoạt động
          </h2>
          <p className="text-xs font-medium text-gray-400">
            Xem lại các thao tác gần đây trên tài khoản của bạn
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <History size={32} />
          </div>
          <p className="font-bold text-gray-400 italic">Chưa có lịch sử hoạt động nào được ghi nhận.</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
          {activities.map((activity, index) => (
            <div key={activity._id} className="relative pl-14 group">
              <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-white border-4 border-[#800a0d] z-10 group-hover:scale-125 transition-transform"></div>
              <div className="p-5 bg-[#fdfaf5] rounded-2xl border border-gray-50 hover:border-[#800a0d]/20 transition-all hover:shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <span className="font-black text-[#800a0d] text-sm uppercase tracking-widest">{activity.action}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(activity.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <p className="text-sm text-[#3e2714] font-medium">{activity.details}</p>
                {activity.ipAddress && (
                  <p className="mt-2 text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-2 italic">IP: {activity.ipAddress.replace('::ffff:', '')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RefreshCcw = ({ size, className }) => (
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
    className={className}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21v-5h5" />
  </svg>
);

export default AccountPage;
