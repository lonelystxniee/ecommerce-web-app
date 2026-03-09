import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  User,
  Package,
  Heart,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Home,
  Camera,
  Clock,
  Truck,
  X,
  ShoppingBag,
  Printer,
  Search,
  Lock,
  History,
  MapPin,
  RefreshCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import AddressManagement from "../components/AddressManagement";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { validateChangePassword } from "../helpers/validate";
import { CheckCircle, AlertCircle, Trash2, ShoppingBasket } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

// --- CẤU HÌNH TRẠNG THÁI ĐƠN HÀNG ---
const STATUS_LABELS = {
  ALL: "Tất cả",
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PACKING: "Đang đóng gói",
  READY_TO_PICK: "Chờ vận chuyển",
  PICKING: "Shipper đã lấy",
  STORING: "Trong kho Mega SOC",
  DELIVERING: "Đang giao hàng",
  DELIVERED: "Giao thành công",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

// --- COMPONENT CHÍNH ---
const AccountPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "info";

  const changeTab = (tab) => setSearchParams({ tab });

  const user = useMemo(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        const parsed = JSON.parse(savedUser);
        if (parsed._id && !parsed.id) parsed.id = parsed._id;
        if (parsed.id && !parsed._id) parsed._id = parsed.id;
        return parsed;
      }
    } catch (error) {
      console.error("Lỗi đọc dữ liệu user:", error);
    }
    return null;
  }, []);

  useEffect(() => {
    if (!user) navigate("/");
    window.scrollTo(0, 0);
  }, [user, navigate, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Đăng xuất thành công!");
    window.location.href = "/";
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen pt-4 pb-20 bg-[#f7f4ef] font-sans"
      style={{
        backgroundImage: `url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')`,
      }}
    >
      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4 mb-8 flex items-center gap-2 text-[12px] font-bold uppercase text-[#88694f] print:hidden">
        <Link
          to="/"
          className="flex items-center gap-1 hover:text-[#800a0d] transition-colors"
        >
          <Home size={14} /> Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#800a0d]">Quản lý tài khoản</span>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <aside className="w-full md:w-[320px] shrink-0 print:hidden">
          <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-gray-100 sticky top-5">
            <div className="bg-[#800a0d] p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')]"></div>
              <div className="relative z-10">
                <div className="inline-block p-1 mb-4 bg-white rounded-full shadow-lg">
                  <div className="w-20 h-20 rounded-full bg-[#fdfaf5] flex items-center justify-center text-[#800a0d] text-2xl font-black border-2 border-[#800a0d]/10 overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        className="object-cover w-full h-full"
                        alt="Avatar"
                      />
                    ) : (
                      user.fullName?.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-white uppercase truncate">
                  Chào, {user.fullName?.split(" ").pop()}
                </h3>
                <p className="text-[11px] text-white/70 font-medium italic">
                  Thành viên ClickGo
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
        </aside>

        {/* CONTENT AREA */}
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

const SidebarItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-5 py-3.5 transition-all duration-200 rounded-xl text-sm font-bold cursor-pointer
      ${active
        ? "bg-[#fdfaf5] text-[#800a0d] shadow-sm border border-[#800a0d]/10"
        : "text-text-primary hover:bg-gray-50 hover:pl-6"
      }`}
  >
    <span className={active ? "text-[#800a0d]" : "text-[#88694f]"}>{icon}</span>
    {text}
  </button>
);

// --- TAB 1: THÔNG TIN CÁ NHÂN ---
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

// --- TAB 2: LỊCH SỬ ĐƠN HÀNG ---
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const componentRef = useRef();

  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user || !(user._id || user.id)) {
          setOrders([]);
          return;
        }
        const userId = user._id || user.id;
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/orders/my-orders/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (data.success) setOrders(data.orders || []);
      } catch (err) {
        console.error("Fetch user orders failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        statusFilter === "ALL" || order.status === statusFilter;
      const matchSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerInfo?.fullName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentItems = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "DELIVERING":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white shadow-2xl rounded-3xl animate-pulse">
        <RefreshCcw className="animate-spin text-[#800a0d] mb-4" size={40} />
        <span className="font-bold text-[#88694f]">Đang tải đơn hàng...</span>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 space-y-6 print:hidden">
        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          <h2 className="text-2xl font-black text-[#800a0d] uppercase tracking-tighter">
            Đơn hàng của tôi
          </h2>
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute -translate-y-1/2 left-4 top-1/2 text-stone-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc tên người nhận..."
              className="w-full pl-12 pr-4 py-3 bg-[#fdfaf5] border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#800a0d] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {Object.keys(STATUS_LABELS).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === st
                ? "bg-[#800a0d] text-white shadow-lg scale-105"
                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
            >
              {STATUS_LABELS[st]}
            </button>
          ))}
        </div>
      </div>

      {/* Order list */}
      {currentItems.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-[40px] border-2 border-dashed border-gray-200">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="italic font-bold text-gray-400">
            Không tìm thấy đơn hàng nào phù hợp.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentItems.map((order) => (
            <div
              key={order._id}
              onClick={() => {
                setSelectedOrder(order);
                setIsModalOpen(true);
              }}
              className="bg-white rounded-[32px] shadow-md border border-gray-50 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#fdfaf5]/50 group-hover:bg-[#fdfaf5]">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-2xl ${getStatusColor(order.status)}`}
                  >
                    <Package size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Mã đơn hàng
                    </span>
                    <p className="font-black text-[#3e2714]">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(order.status)}`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <Link
                    to={`/order-tracking/${order._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-3 bg-white text-[#800a0d] rounded-full border border-gray-100 hover:bg-[#800a0d] hover:text-white transition-all shadow-sm"
                    title="Theo dõi hành trình"
                  >
                    <Truck size={18} />
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-between p-6 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs italic font-bold text-gray-400">
                  <Clock size={14} />{" "}
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-300 uppercase">
                    Tổng thanh toán
                  </p>
                  <p className="text-xl font-black text-[#800a0d]">
                    {order.totalPrice.toLocaleString()}đ
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 transition-all bg-white border border-gray-100 rounded-full disabled:opacity-20 hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-full font-black text-xs transition-all ${currentPage === i + 1
                    ? "bg-[#800a0d] text-white shadow-lg"
                    : "bg-white text-gray-400"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 transition-all bg-white border border-gray-100 rounded-full disabled:opacity-20 hover:bg-gray-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl flex flex-col border-t-8 border-[#800a0d]">
            {/* Header Modal */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b print:hidden">
              <div className="flex items-center gap-2 text-[#800a0d]">
                <Printer size={20} />
                <h3 className="font-black tracking-widest uppercase">
                  Chi tiết hóa đơn
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 transition-all rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Nội dung hóa đơn */}
            <div ref={componentRef} className="p-8 space-y-10 bg-white md:p-12">
              <div className="flex justify-between items-start border-b-4 border-[#800a0d] pb-8">
                <div>
                  <h1 className="text-4xl font-black text-[#800a0d] tracking-tighter">
                    CLICK GO
                  </h1>
                  <p className="text-sm italic font-bold text-gray-500">
                    Tinh hoa quà Việt - Hệ thống ClickGo
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-black text-[#800a0d] uppercase">
                    Hóa đơn bán hàng
                  </h2>
                  <p className="text-sm font-bold">
                    Số: #{selectedOrder._id.slice(-12).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-gray-400 italic">
                    Ngày in: {new Date().toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 text-sm">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#800a0d] border-b border-gray-100 pb-2">
                    Thông tin người nhận
                  </h4>
                  <p className="text-base font-black text-gray-800">
                    {selectedOrder.customerInfo?.fullName}
                  </p>
                  <p className="font-bold text-gray-500">
                    SĐT: {selectedOrder.customerInfo?.phone}
                  </p>
                  <p className="text-xs italic leading-relaxed text-gray-400">
                    {selectedOrder.customerInfo?.address}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#800a0d] border-b border-gray-100 pb-2">
                    Chi tiết giao dịch
                  </h4>
                  <p className="font-bold text-gray-700">
                    PT Thanh toán:{" "}
                    <span className="text-orange-600">
                      {selectedOrder.paymentMethod}
                    </span>
                  </p>
                  <p className="text-xs font-bold uppercase">
                    Trạng thái: {STATUS_LABELS[selectedOrder.status]}
                  </p>
                  <p className="text-xs italic font-bold text-gray-400">
                    Ngày đặt:{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden border border-gray-100 rounded-3xl print:border-black">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50 print:bg-white">
                    <tr className="text-[10px] font-black uppercase text-gray-400 print:text-black">
                      <th className="py-4 pl-6 text-left">Sản phẩm</th>
                      <th className="py-4 text-center">SL</th>
                      <th className="py-4 pr-6 text-right">Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                item.image || (item.images && item.images[0])
                              }
                              className="object-contain w-12 h-12 rounded-lg bg-gray-50 print:hidden"
                              alt=""
                            />
                            <div>
                              <p className="font-black text-gray-800">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-gray-400 italic">
                                {item.label || "Tiêu chuẩn"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-black text-center">
                          x{item.quantity}
                        </td>
                        <td className="py-4 pr-6 font-black text-right text-gray-800">
                          {item.price.toLocaleString()}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-8 bg-[#800a0d]/5 flex justify-between items-center print:bg-white print:border-t-2">
                  <span className="font-black text-[#800a0d] uppercase tracking-widest text-xs print:text-black">
                    Tổng thanh toán
                  </span>
                  <span className="text-4xl font-black text-[#800a0d] print:text-black">
                    {selectedOrder.totalPrice.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <div className="hidden print:grid grid-cols-2 text-center pt-20 text-[10px] font-black uppercase tracking-widest gap-20">
                <div>
                  <p>Người lập hóa đơn</p>
                  <div className="w-32 mx-auto mt-20 border-t border-gray-300 border-dashed"></div>
                </div>
                <div>
                  <p>Khách hàng ký nhận</p>
                  <div className="w-32 mx-auto mt-20 border-t border-gray-300 border-dashed"></div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="sticky bottom-0 z-10 flex flex-col justify-center gap-4 p-8 border-t bg-gray-50 md:flex-row print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-12 py-3 text-xs font-black tracking-widest text-white uppercase transition-all bg-orange-500 rounded-full shadow-xl hover:bg-orange-600"
              >
                <Printer size={18} /> In hóa đơn ngay
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-[#3e2714] text-white px-12 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-black transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- TAB 3: ĐỔI MẬT KHẨU ---
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
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
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
    <div className="p-8 mx-auto bg-white border border-gray-100 shadow-2xl animate-zoomIn rounded-3xl">
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
        {[
          { name: "oldPassword", label: "Mật khẩu hiện tại" },
          { name: "newPassword", label: "Mật khẩu mới" },
          { name: "confirmPassword", label: "Xác nhận mật khẩu mới" },
        ].map(({ name, label }) => (
          <div key={name} className="space-y-2">
            <label className="block pl-1 text-[13px] font-black text-text-primary">
              {label}
            </label>
            <input
              type="password"
              name={name}
              required
              value={formData[name]}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full px-5 py-2 bg-[#fdfaf5] border rounded-2xl outline-none focus:bg-white transition-all font-bold text-[#3e2714] ${errors[name]
                ? "border-red-500"
                : "border-gray-100 focus:border-[#800a0d]"
                }`}
            />
            {errors[name] && (
              <p className="pl-1 text-xs font-bold text-red-500">
                {errors[name]}
              </p>
            )}
          </div>
        ))}
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

// --- TAB 4: LỊCH SỬ HOẠT ĐỘNG ---
const ActivityHistory = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/auth/activities`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (data.success) setActivities(data.activities || []);
      } catch (e) {
        console.error("Fetch activities failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white shadow-2xl rounded-3xl animate-pulse">
        <RefreshCcw className="animate-spin text-[#800a0d] mb-4" size={40} />
        <span className="font-bold text-[#88694f]">
          Đang tải lịch sử hoạt động...
        </span>
      </div>
    );

  return (
    <div className="p-8 bg-white border border-gray-100 shadow-2xl rounded-[40px] animate-fadeIn">
      <div className="flex items-center gap-4 pb-6 mb-8 border-b border-gray-200 border-dashed">
        <div className="w-12 h-12 bg-[#fdfaf5] rounded-xl flex items-center justify-center text-[#800a0d] shadow-sm">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#800a0d] tracking-tighter">
            Lịch sử hoạt động
          </h2>
          <p className="text-xs font-medium text-gray-400">
            Các hoạt động gần đây trên tài khoản của bạn
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-20 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-gray-300 rounded-full bg-gray-50">
            <History size={32} />
          </div>
          <p className="text-sm italic font-bold text-gray-400">
            Chưa có hoạt động nào được ghi lại
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
          {activities.map((activity) => (
            <div key={activity._id} className="relative pl-14 group">
              <div className="absolute left-0 top-1 w-12 h-12 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center transition-all group-hover:border-[#800a0d] group-hover:scale-110 z-10 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-[#800a0d] group-hover:animate-ping absolute"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#800a0d] relative"></div>
              </div>
              <div className="bg-[#fdfaf5]/30 p-5 rounded-3xl border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:border-[#800a0d]/10">
                <div className="flex flex-col items-start justify-between gap-2 mb-2 sm:flex-row">
                  <h4 className="font-black text-[#800a0d] text-base tracking-tight">
                    {activity.action}
                  </h4>
                  <span className="text-[10px] font-black text-[#88694f] bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm whitespace-nowrap">
                    {new Date(activity.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-gray-600">
                  {activity.details}
                </p>
                {activity.ipAddress && (
                  <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black text-[#88694f] uppercase tracking-[0.1em] opacity-60">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>IP: {activity.ipAddress}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- TAB 5: SẢN PHẨM YÊU THÍCH ---
const FavoriteProducts = () => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(wishlistItems.length / itemsPerPage);
  const currentItems = wishlistItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      id: product._id,
      name: product.productName,
      price: product.price,
      quantity: 1,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : product.image,
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-gray-100 shadow-2xl rounded-[40px] animate-fadeIn">
        <div className="w-24 h-24 bg-[#fdfaf5] rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart size={44} className="text-[#800a0d]/20" fill="currentColor" />
        </div>
        <h2 className="text-2xl font-black text-[#3e2714] mb-2 tracking-tight">
          Danh sách yêu thích trống
        </h2>
        <p className="max-w-xs mx-auto mb-8 italic text-sm text-gray-400">
          Lưu lại những món quà bạn yêu thích để dễ dàng tìm lại sau này.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#800a0d] text-white px-10 py-3 rounded-full font-black uppercase text-xs tracking-widest shadow-lg hover:rounded-sm transition-all active:scale-95"
        >
          <ShoppingBag size={14} /> Khám phá ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 border border-gray-100 shadow-2xl rounded-[40px] animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-dashed border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#800a0d] rounded-xl flex items-center justify-center shadow-md shadow-red-900/20">
            <Heart size={18} className="text-white fill-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#800a0d] tracking-tighter">
              Sản phẩm yêu thích
            </h2>
            <p className="text-xs font-bold text-gray-400">
              {wishlistItems.length} sản phẩm đang được lưu
            </p>
          </div>
        </div>
        <Link
          to="/wishlist"
          className="text-[11px] font-black text-[#88694f] hover:text-[#800a0d] uppercase tracking-widest transition-colors flex items-center gap-1"
        >
          Xem tất cả <ChevronRight size={14} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-8">
        {currentItems.map((item) => {
          const displayImage =
            item.images && item.images.length > 0 ? item.images[0] : item.image;
          return (
            <div
              key={item._id}
              className="group bg-[#fdfaf5]/50 border border-gray-100 rounded-[24px] overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <Link
                to={`/product/${item._id}`}
                className="relative block overflow-hidden bg-white aspect-square"
              >
                <img
                  src={displayImage}
                  alt={item.productName}
                  className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110 p-2"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(item._id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                  title="Xóa khỏi yêu thích"
                >
                  <Trash2 size={12} />
                </button>
              </Link>
              <div className="p-3">
                <Link
                  to={`/product/${item._id}`}
                  className="block text-sm font-bold text-[#3e2714] hover:text-[#800a0d] transition-colors line-clamp-2 mb-1 leading-snug"
                >
                  {item.productName}
                </Link>
                <p className="text-xs font-black text-[#800a0d] mb-3">
                  {item.price?.toLocaleString()}đ
                </p>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-[#f39200] text-white py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBasket size={12} /> Thêm giỏ
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full border border-gray-100 bg-white text-[#88694f] hover:bg-[#800a0d] hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft size={18} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-9 h-9 rounded-full font-black text-xs transition-all ${currentPage === i + 1
                ? "bg-[#800a0d] text-white shadow-lg"
                : "bg-white text-[#88694f] border border-gray-100 hover:border-[#800a0d]"
                }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full border border-gray-100 bg-white text-[#88694f] hover:bg-[#800a0d] hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
