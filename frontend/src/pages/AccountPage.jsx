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
  MapPin,
  RefreshCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import AddressManagement from "../components/AddressManagement";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { validateChangePassword } from "../helpers/validate";

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
                  icon={<MapPin size={18} />}
                  text="Địa chỉ giao hàng"
                  active={activeTab === "addresses"}
                  onClick={() => changeTab("addresses")}
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
        </div>

        {/* --- CONTENT AREA --- */}
        <main className="flex-1 w-full min-h-150">
          <div className="transition-all duration-300">
            {activeTab === "info" && <PersonalInfo user={user} />}
            {activeTab === "orders" && <OrderManagement />}
            {activeTab === "addresses" && <AddressManagement user={user} />}
            {activeTab === "favorites" && <FavoriteProducts />}
            {activeTab === "password" && <ChangePassword />}
            {activeTab === "activities" && <ActivityHistory />}
          </div>
        </main>
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

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Placeholder: implement actual save logic when backend API available
      toast.success("Lưu thông tin thành công (tạm)");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Lưu thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

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

// 2. Tab Quản lý đơn hàng (Customer) - hiển thị lịch sử đơn và liên kết theo dõi
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user || !user._id) {
          setOrders([]);
          return;
        }
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/user/${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setOrders(data.orders || []);
      } catch (err) {
        console.error('Fetch user orders failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-6">Đang tải lịch sử đơn hàng...</div>;
  if (!orders || orders.length === 0)
    return (
      <div className="p-12 text-center bg-white border border-gray-100 shadow-2xl animate-zoomIn rounded-3xl">
        <div className="w-24 h-24 bg-[#fdfaf5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#800a0d]/20">
          <Package size={48} />
        </div>
        <h2 className="text-2xl font-bold text-[#3e2714] mb-2 tracking-tight">Bạn chưa có đơn hàng</h2>
        <p className="max-w-sm mx-auto mb-8 text-sm italic font-medium text-gray-500">Hãy đặt hàng để theo dõi trạng thái vận chuyển.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-[#800a0d] text-white px-8 py-3 rounded-[30px] font-bold text-sm tracking-widest hover:rounded-md transition-all active:scale-95">Mua hàng ngay</Link>
      </div>
    );

  return (
    <div className="p-6 bg-white border border-gray-100 shadow-2xl animate-zoomIn rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h2>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o._id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <div className="font-bold">Mã: #{o._id.substring(o._id.length - 6).toUpperCase()}</div>
              <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
              <div className="text-sm">Tổng: {o.totalPrice.toLocaleString()}đ</div>
              <div className="text-sm">Trạng thái: {o.shipping?.shippingStatus || o.status}</div>
            </div>
            <div className="flex gap-2">
              <Link to={`/order-tracking/${o._id}`} className="px-3 py-2 bg-[#9d0b0f] text-white rounded">Theo dõi</Link>
              <button onClick={() => navigator.clipboard.writeText(o._id)} className="px-3 py-2 bg-gray-100 rounded">Sao chép mã</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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

      {activities.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <History size={32} />
          </div>
        </div>
      )}
    </div>
  );
};

// Note: OrderManagement and FavoriteProducts are defined earlier in this file.

export default AccountPage;
