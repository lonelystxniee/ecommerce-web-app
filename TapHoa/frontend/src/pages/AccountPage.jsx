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
  MapPin,
  Truck,
  X,
  ShoppingBag,
  Printer,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

// --- COMPONENT CHÍNH ---
const AccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "info");

  const user = useMemo(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error("Lỗi đọc dữ liệu user:", error);
    }
    return null;
  }, []);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "info");
    window.scrollTo(0, 0);
  }, [searchParams]);

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
      className="min-h-screen bg-[#f7f4ef] font-sans pt-5 pb-20"
      style={{
        backgroundImage: `url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')`,
      }}
    >
      {/* Navigation Breadcrumb - Ẩn khi in */}
      <div className="max-w-[1200px] mx-auto px-4 mb-6 flex items-center gap-2 text-[12px] font-bold uppercase text-[#88694f] print:hidden">
        <Link
          to="/"
          className="flex items-center gap-1 hover:text-[#9d0b0f] transition-colors"
        >
          <Home size={14} /> Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#9d0b0f]">Quản lý tài khoản</span>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* SIDEBAR - Ẩn khi in */}
        <div className="w-full md:w-[280px] shrink-0 print:hidden">
          <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-[#9d0b0f]/10 sticky top-5">
            <div className="bg-[#9d0b0f] text-white p-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black border-2 border-white/50">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter">
                Chào, {user?.fullName?.split(" ").pop()}
              </h2>
              <p className="text-[10px] opacity-70 mt-1 uppercase tracking-widest font-bold">
                Thành viên ClickGo
              </p>
            </div>
            <nav className="flex flex-col p-3">
              <SidebarItem
                icon={<User size={18} />}
                text="Thông tin tài khoản"
                active={activeTab === "info"}
                onClick={() => changeTab("info")}
              />
              <SidebarItem
                icon={<Package size={18} />}
                text="Đơn hàng của tôi"
                active={activeTab === "orders"}
                onClick={() => changeTab("orders")}
              />
              <SidebarItem
                icon={<Heart size={18} />}
                text="Sản phẩm yêu thích"
                active={activeTab === "favorites"}
                onClick={() => changeTab("favorites")}
              />
              <div className="h-px bg-stone-100 my-2 mx-4"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 text-[#9d0b0f] font-bold hover:bg-red-50 transition-all rounded-2xl"
              >
                <LogOut size={18} />
                <span className="text-sm uppercase tracking-tight">
                  Đăng xuất
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {activeTab === "info" && user && <PersonalInfo user={user} />}
          {activeTab === "orders" && user && (
            <OrderList userId={user.id || user._id} />
          )}
          {activeTab === "favorites" && <FavoriteProducts />}
        </div>
      </div>
    </div>
  );
};

// --- SIDEBAR ITEM ---
const SidebarItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 transition-all rounded-2xl mb-1 ${
      active
        ? "bg-[#f39200] text-white shadow-lg font-bold"
        : "text-[#3e2714] hover:bg-[#f7f4ef]"
    }`}
  >
    {icon}
    <span className="text-sm uppercase tracking-tight">{text}</span>
  </button>
);

// --- TAB: THÔNG TIN CÁ NHÂN ---
const PersonalInfo = ({ user }) => {
  const [avatar, setAvatar] = useState(user.avatar || null);
  const fileInputRef = useRef(null);

  return (
    <div className="animate-fadeIn bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-[40px] shadow-sm border border-white">
      <h2 className="text-3xl font-black text-[#9d0b0f] mb-8 uppercase tracking-tighter border-b border-[#9d0b0f]/10 pb-4">
        Hồ sơ cá nhân
      </h2>
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-[#f7f4ef] border-4 border-white flex items-center justify-center text-[#9d0b0f] text-5xl font-black shadow-2xl overflow-hidden object-cover">
              {avatar ? (
                <img
                  src={avatar}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              ) : (
                user.fullName?.charAt(0)
              )}
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-1 right-1 bg-[#f39200] text-white p-3 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-all"
            >
              <Camera size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setAvatar(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputReadonly label="Họ và tên" value={user.fullName} />
          <InputReadonly label="Số điện thoại" value={user.phone} />
          <div className="md:col-span-2">
            <InputReadonly label="Email đăng ký" value={user.email} />
          </div>
        </div>
      </div>
    </div>
  );
};

const InputReadonly = ({ label, value }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-[#88694f] uppercase tracking-widest ml-2">
      {label}
    </label>
    <div className="w-full p-4 rounded-2xl bg-[#f7f4ef]/50 border border-stone-200 text-[#3e2714] font-bold italic">
      {value || "Chưa cập nhật"}
    </div>
  </div>
);

const STATUS_LABELS = {
  ALL: "Tất cả",
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận đơn",
  PACKING: "Đang đóng gói",
  READY_TO_PICK: "Đơn hàng chuyển cho đơn vị vận chuyển",
  PICKING: "Shipper đã lấy hàng",
  STORING: "Đã nhập kho Mega SOC",
  DELIVERING: "Đang giao hàng",
  DELIVERED: "Giao hàng thành công",
  COMPLETED: "Đơn hàng hoàn tất",
  CANCELLED: "Đã hủy đơn",
};

// --- TAB: DANH SÁCH ĐƠN HÀNG (QUAN TRỌNG NHẤT) ---
const OrderList = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States cho Tìm kiếm, Lọc và Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `HoaDon_ClickGo_${selectedOrder?._id?.substring(0, 8).toUpperCase()}`,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `http://localhost:5175/api/orders/my-orders/${userId}`,
        );
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  // Logic Lọc & Tìm kiếm
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        statusFilter === "ALL" || order.status === statusFilter;
      const matchSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  // Logic Phân trang
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentItems = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter]);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse font-bold text-[#88694f]">
        Đang tải lịch sử đơn hàng...
      </div>
    );

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100 space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <h2 className="text-2xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            Đơn hàng của tôi
          </h2>
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc tên người nhận..."
              className="w-full pl-12 pr-4 py-3 bg-[#f7f4ef] border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#f39200] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          {Object.keys(STATUS_LABELS).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === st
                  ? "bg-[#9d0b0f] text-white shadow-lg scale-105"
                  : "bg-stone-50 text-stone-400 hover:bg-stone-100"
              }`}
            >
              {STATUS_LABELS[st]} {/* Sử dụng tiếng Việt ở đây */}
            </button>
          ))}
        </div>
      </div>

      {/* Order Cards */}
      {currentItems.length === 0 ? (
        <div className="bg-white/50 rounded-[40px] p-20 text-center border-2 border-dashed border-stone-200">
          <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-400 font-bold italic">
            Không tìm thấy đơn hàng nào.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentItems.map((order) => (
            <div
              key={order._id}
              onClick={() => handleOpenDetail(order)}
              className="bg-white rounded-[32px] shadow-sm border border-stone-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#f7f4ef]/30 group-hover:bg-[#f7f4ef]/60">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-2xl ${getStatusColor(order.status).bg} ${getStatusColor(order.status).text}`}
                  >
                    <Package size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Mã đơn hàng
                    </span>
                    <p className="font-black text-[#3e2714]">
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(order.status).bg} ${getStatusColor(order.status).text}`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <Link
                    to={`/order-tracking/${order._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-white text-[#9d0b0f] rounded-full hover:bg-[#9d0b0f] hover:text-white transition-all shadow-sm"
                  >
                    <Truck size={18} />
                  </Link>
                </div>
              </div>
              <div className="p-6 flex justify-between items-center border-t border-stone-50">
                <div className="flex items-center gap-2 text-stone-400 font-bold text-xs">
                  <Clock size={14} />{" "}
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-stone-300 uppercase">
                    Tổng thanh toán
                  </p>
                  <p className="text-xl font-black text-[#9d0b0f]">
                    {order.totalPrice.toLocaleString()}đ
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-full bg-white border disabled:opacity-20 hover:bg-stone-50"
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-full font-black text-xs transition-all ${currentPage === i + 1 ? "bg-[#f39200] text-white shadow-lg" : "bg-white text-stone-400"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-full bg-white border disabled:opacity-20 hover:bg-stone-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- INVOICE MODAL --- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl flex flex-col border-t-8 border-[#9d0b0f]">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10 print:hidden">
              <div className="flex items-center gap-2 text-[#9d0b0f]">
                <Printer size={20} />
                <h3 className="font-black uppercase tracking-widest">
                  Chi tiết hóa đơn
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* PRINT CONTENT AREA */}
            <div ref={componentRef} className="p-8 md:p-12 space-y-10 bg-white">
              {/* Header Hóa đơn (Chỉ hiện khi in) */}
              <div className="hidden print:flex justify-between items-start border-b-4 border-[#9d0b0f] pb-8">
                <div>
                  <h1 className="text-4xl font-black text-[#9d0b0f] tracking-tighter">
                    CLICK GO
                  </h1>
                  <p className="text-sm font-bold text-stone-500 italic">
                    Tinh hoa quà Việt - Hệ thống ClickGo
                  </p>
                  <p className="text-[10px] text-stone-400 mt-2 uppercase">
                    Website: clickgo.vn | Hotline: 1900 8122
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-black text-[#9d0b0f] uppercase">
                    Hóa đơn bán hàng
                  </h2>
                  <p className="font-bold text-sm mt-1">
                    Số: #{selectedOrder._id.substring(0, 12).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-stone-400 italic mt-1">
                    Ngày in: {new Date().toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Thông tin khách hàng & Đơn hàng */}
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#9d0b0f] tracking-[0.2em] border-b border-stone-100 pb-2 print:border-black print:text-black">
                    Thông tin người nhận
                  </h4>
                  <div className="text-sm space-y-1">
                    <p className="font-black text-stone-800 text-base">
                      {selectedOrder.customerInfo.fullName}
                    </p>
                    <p className="font-bold text-stone-500">
                      SĐT: {selectedOrder.customerInfo.phone}
                    </p>
                    <p className="text-stone-400 italic leading-relaxed text-xs">
                      {selectedOrder.customerInfo.address}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#9d0b0f] tracking-[0.2em] border-b border-stone-100 pb-2 print:border-black print:text-black">
                    Chi tiết giao dịch
                  </h4>
                  <div className="text-sm space-y-2">
                    <p className="font-bold">
                      PT Thanh toán:{" "}
                      <span className="text-[#f39200] print:text-black">
                        {selectedOrder.paymentMethod}
                      </span>
                    </p>
                    <p className="font-bold">
                      Trạng thái:{" "}
                      <span className="uppercase text-xs">
                        {STATUS_LABELS[selectedOrder.status] ||
                          selectedOrder.status}
                      </span>
                    </p>
                    <p className="text-stone-400 text-xs font-bold italic">
                      Ngày đặt:{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString(
                        "vi-VN",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bảng sản phẩm */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-[#9d0b0f] tracking-[0.2em] print:text-black">
                  Danh sách sản phẩm
                </h4>
                <div className="border border-stone-100 rounded-3xl overflow-hidden print:border-black print:rounded-none">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50 print:bg-white border-b print:border-black">
                      <tr className="text-[10px] font-black uppercase text-stone-400 print:text-black">
                        <th className="py-4 pl-6 text-left">Sản phẩm</th>
                        <th className="py-4 text-center">SL</th>
                        <th className="py-4 pr-6 text-right">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 print:divide-black">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-4 pl-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  item.image || (item.images && item.images[0])
                                }
                                className="w-12 h-12 rounded-lg object-contain bg-stone-50 print:hidden"
                                alt=""
                              />
                              <div>
                                <p className="font-black text-stone-800">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-stone-400 italic">
                                  {item.label || "Tiêu chuẩn"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center font-black">
                            x{item.quantity}
                          </td>
                          <td className="py-4 pr-6 text-right font-black text-stone-800">
                            {item.price.toLocaleString()}đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-8 bg-[#9d0b0f]/5 flex justify-between items-center print:bg-white print:border-t-2 print:border-black">
                    <span className="font-black text-[#9d0b0f] uppercase tracking-widest text-xs print:text-black">
                      Tổng thanh toán
                    </span>
                    <span className="text-4xl font-black text-[#9d0b0f] print:text-black">
                      {selectedOrder.totalPrice.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures (Chỉ hiện khi in) */}
              <div className="hidden print:grid grid-cols-2 text-center pt-20 text-xs font-black uppercase tracking-widest gap-20">
                <div>
                  <p>Người lập hóa đơn</p>
                  <div className="mt-24 border-t border-dashed border-stone-300 w-40 mx-auto"></div>
                </div>
                <div>
                  <p>Khách hàng ký nhận</p>
                  <div className="mt-24 border-t border-dashed border-stone-300 w-40 mx-auto"></div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Nút In) */}
            <div className="p-8 bg-stone-50 border-t flex flex-col md:flex-row justify-center gap-4 sticky bottom-0 z-10 print:hidden">
              <button
                onClick={handlePrint}
                className="bg-[#f39200] text-white px-12 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
              >
                <Printer size={18} /> In hóa đơn ngay
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-[#3e2714] text-white px-12 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Global cho Print */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: A4; margin: 15mm; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

// Helper function
const getStatusColor = (status) => {
  switch (status) {
    case "COMPLETED":
      return { bg: "bg-green-100", text: "text-green-600" };
    case "CANCELLED":
      return { bg: "bg-red-100", text: "text-red-600" };
    case "SHIPPING":
      return { bg: "bg-blue-100", text: "text-blue-600" };
    case "PROCESSING":
      return { bg: "bg-orange-100", text: "text-orange-600" };
    default:
      return { bg: "bg-stone-100", text: "text-stone-600" };
  }
};

const FavoriteProducts = () => (
  <div className="animate-fadeIn bg-white/70 p-10 rounded-[40px] shadow-sm border border-white min-h-[400px] flex flex-col items-center justify-center text-center">
    <div className="w-24 h-24 bg-[#f7f4ef] rounded-full flex items-center justify-center text-[#9d0b0f] mb-6 shadow-inner">
      <Heart size={40} fill="currentColor" />
    </div>
    <h2 className="text-2xl font-black text-[#3e2714] uppercase mb-2">
      Sản phẩm yêu thích
    </h2>
    <p className="text-stone-400 italic max-w-xs">
      Bạn chưa thêm sản phẩm nào vào danh sách yêu thích của mình.
    </p>
    <Link
      to="/"
      className="mt-8 px-8 py-3 bg-[#9d0b0f] text-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-black transition-all"
    >
      Khám phá ngay
    </Link>
  </div>
);

export default AccountPage;
