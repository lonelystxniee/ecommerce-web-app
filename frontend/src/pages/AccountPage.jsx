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
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import toast from "react-hot-toast";

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
                        className="w-full h-full object-cover"
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

            <nav className="p-3 space-y-1">
              <SidebarItem
                icon={<User size={18} />}
                text="Thông tin tài khoản"
                active={activeTab === "info"}
                onClick={() => navigate("/account?tab=info")}
              />
              <SidebarItem
                icon={<Package size={18} />}
                text="Đơn hàng của tôi"
                active={activeTab === "orders"}
                onClick={() => navigate("/account?tab=orders")}
              />
              <SidebarItem
                icon={<Heart size={18} />}
                text="Sản phẩm yêu thích"
                active={activeTab === "favorites"}
                onClick={() => navigate("/account?tab=favorites")}
              />
              <SidebarItem
                icon={<Lock size={18} />}
                text="Đổi mật khẩu"
                active={activeTab === "password"}
                onClick={() => navigate("/account?tab=password")}
              />
              <SidebarItem
                icon={<History size={18} />}
                text="Lịch sử hoạt động"
                active={activeTab === "activities"}
                onClick={() => navigate("/account?tab=activities")}
              />
              <div className="h-px bg-gray-100 my-2 mx-4"></div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-3 px-5 py-3.5 text-[#800a0d] font-bold hover:bg-red-50 transition-all rounded-xl text-sm uppercase"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {activeTab === "info" && <PersonalInfo user={user} />}
          {activeTab === "orders" && <OrderList userId={user.id || user._id} />}
          {activeTab === "favorites" && <FavoriteProducts />}
          {activeTab === "password" && <ChangePassword />}
          {activeTab === "activities" && <ActivityHistory />}
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-5 py-3.5 transition-all duration-200 rounded-xl text-sm font-bold uppercase tracking-tight
      ${active ? "bg-[#fdfaf5] text-[#800a0d] shadow-sm border border-[#800a0d]/10" : "text-[#3e2714] hover:bg-gray-50 hover:pl-6"}`}
  >
    <span className={active ? "text-[#800a0d]" : "text-[#88694f]"}>{icon}</span>
    {text}
  </button>
);

// THÔNG TIN CÁ NHÂN
const PersonalInfo = ({ user }) => {
  return (
    <div className="p-8 bg-white border border-gray-100 shadow-2xl rounded-[40px] animate-fadeIn">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 border-dashed">
        <h2 className="text-2xl font-black text-[#800a0d] uppercase tracking-tighter">
          Hồ sơ cá nhân
        </h2>
      </div>
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex flex-col items-center shrink-0">
          <div className="relative group">
            <div className="w-44 h-44 rounded-full p-1.5 border-2 border-dashed border-[#800a0d]/30">
              <div className="w-full h-full overflow-hidden bg-gray-50 rounded-full flex items-center justify-center text-[#800a0d] text-5xl font-black">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    className="w-full h-full object-cover"
                    alt="Avatar"
                  />
                ) : (
                  user.fullName?.charAt(0)
                )}
              </div>
            </div>
            <button className="absolute bottom-2 right-2 bg-[#800a0d] text-white p-2.5 rounded-full border-4 border-white shadow-xl hover:scale-110 transition-transform">
              <Camera size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-[#88694f] uppercase ml-1">
              Họ và tên
            </label>
            <div className="w-full px-5 py-3 bg-[#fdfaf5] border border-gray-100 rounded-2xl font-bold text-[#3e2714] italic">
              {user.fullName}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-[#88694f] uppercase ml-1">
              Số điện thoại
            </label>
            <div className="w-full px-5 py-3 bg-[#fdfaf5] border border-gray-100 rounded-2xl font-bold text-[#3e2714] italic">
              {user.phone || "Chưa cập nhật"}
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[11px] font-black text-[#88694f] uppercase ml-1">
              Email đăng ký
            </label>
            <div className="w-full px-5 py-3 bg-[#fdfaf5] border border-gray-100 rounded-2xl font-bold text-[#3e2714] italic">
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// DANH SÁCH ĐƠN HÀNG
const OrderList = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentItems = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
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
      <div className="p-20 text-center font-bold text-[#88694f] animate-pulse">
        Đang tải lịch sử đơn hàng...
      </div>
    );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tìm kiếm & Lọc */}
      <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 space-y-6 print:hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <h2 className="text-2xl font-black text-[#800a0d] uppercase tracking-tighter">
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
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === st
                  ? "bg-[#800a0d] text-white shadow-lg scale-105"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {STATUS_LABELS[st]}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách thẻ đơn hàng */}
      {currentItems.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-[40px] border-2 border-dashed border-gray-200">
          <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold italic">
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

                  {/* NÚT THEO DÕI ĐƠN HÀNG */}
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
              <div className="p-6 flex justify-between items-center border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs italic">
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
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-full bg-white border border-gray-100 disabled:opacity-20 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-full font-black text-xs transition-all ${currentPage === i + 1 ? "bg-[#800a0d] text-white shadow-lg" : "bg-white text-gray-400"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-full bg-white border border-gray-100 disabled:opacity-20 hover:bg-gray-50 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/*  MODAL IN HÓA ĐƠN  */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl flex flex-col border-t-8 border-[#800a0d]">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10 print:hidden">
              <div className="flex items-center gap-2 text-[#800a0d]">
                <Printer size={20} />
                <h3 className="font-black uppercase tracking-widest">
                  Chi tiết hóa đơn
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* VÙNG NỘI DUNG IN */}
            <div ref={componentRef} className="p-8 md:p-12 space-y-10 bg-white">
              {/* hóa đơn */}
              <div className="flex justify-between items-start border-b-4 border-[#800a0d] pb-8">
                <div>
                  <h1 className="text-4xl font-black text-[#800a0d] tracking-tighter">
                    CLICK GO
                  </h1>
                  <p className="text-sm font-bold text-gray-500 italic">
                    Tinh hoa quà Việt - Hệ thống ClickGo
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-black text-[#800a0d] uppercase">
                    Hóa đơn bán hàng
                  </h2>
                  <p className="font-bold text-sm">
                    Số: #{selectedOrder._id.slice(-12).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-gray-400 italic">
                    Ngày in: {new Date().toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Thông tin khách & Giao dịch */}
              <div className="grid grid-cols-2 gap-12 text-sm">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#800a0d] border-b border-gray-100 pb-2">
                    Thông tin người nhận
                  </h4>
                  <p className="font-black text-gray-800 text-base">
                    {selectedOrder.customerInfo.fullName}
                  </p>
                  <p className="font-bold text-gray-500">
                    SĐT: {selectedOrder.customerInfo.phone}
                  </p>
                  <p className="text-gray-400 italic leading-relaxed text-xs">
                    {selectedOrder.customerInfo.address}
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
                  <p className="font-bold text-xs uppercase">
                    Trạng thái: {STATUS_LABELS[selectedOrder.status]}
                  </p>
                  <p className="text-gray-400 text-xs font-bold italic">
                    Ngày đặt:{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Bảng sản phẩm */}
              <div className="border border-gray-100 rounded-3xl overflow-hidden print:border-black">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 print:bg-white border-b">
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
                              className="w-12 h-12 rounded-lg object-contain bg-gray-50 print:hidden"
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
                        <td className="py-4 text-center font-black">
                          x{item.quantity}
                        </td>
                        <td className="py-4 pr-6 text-right font-black text-gray-800">
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

              {/* Chữ ký  */}
              <div className="hidden print:grid grid-cols-2 text-center pt-20 text-[10px] font-black uppercase tracking-widest gap-20">
                <div>
                  <p>Người lập hóa đơn</p>
                  <div className="mt-20 border-t border-dashed border-gray-300 w-32 mx-auto"></div>
                </div>
                <div>
                  <p>Khách hàng ký nhận</p>
                  <div className="mt-20 border-t border-dashed border-gray-300 w-32 mx-auto"></div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t flex flex-col md:flex-row justify-center gap-4 sticky bottom-0 z-10 print:hidden">
              <button
                onClick={handlePrint}
                className="bg-orange-500 text-white px-12 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-2"
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

const FavoriteProducts = () => (
  <div className="p-12 text-center bg-white border border-gray-100 shadow-2xl rounded-[40px] animate-fadeIn">
    <div className="w-24 h-24 bg-[#fdfaf5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#800a0d]/20">
      <Heart size={48} fill="currentColor" />
    </div>
    <h2 className="text-2xl font-bold text-[#3e2714] mb-2 uppercase">
      Sản phẩm yêu thích trống
    </h2>
    <p className="max-w-xs mx-auto mb-8 text-gray-400 italic">
      Lưu lại những món quà bạn yêu thích để dễ dàng tìm lại sau này.
    </p>
    <Link
      to="/"
      className="inline-block bg-[#800a0d] text-white px-10 py-3 rounded-full font-bold uppercase text-xs tracking-widest shadow-lg hover:rounded-sm transition-all"
    >
      Khám phá ngay
    </Link>
  </div>
);

const ChangePassword = () => (
  <div className="p-8 bg-white border border-gray-100 shadow-2xl rounded-[40px] animate-fadeIn">
    <div className="flex items-center gap-4 pb-6 mb-8 border-b border-gray-200 border-dashed">
      <div className="w-12 h-12 bg-[#fdfaf5] rounded-xl flex items-center justify-center text-[#800a0d] shadow-sm">
        <Lock size={24} />
      </div>
      <h2 className="text-2xl font-black text-[#800a0d] uppercase tracking-tighter">
        Đổi mật khẩu
      </h2>
    </div>
    <form className="max-w-md space-y-6">
      <div className="space-y-2">
        <label className="text-[11px] font-black text-[#88694f] uppercase ml-1">
          Mật khẩu hiện tại
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full px-5 py-3 bg-[#fdfaf5] border border-gray-100 rounded-2xl font-bold outline-none focus:border-[#800a0d]"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-black text-[#88694f] uppercase ml-1">
          Mật khẩu mới
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full px-5 py-3 bg-[#fdfaf5] border border-gray-100 rounded-2xl font-bold outline-none focus:border-[#800a0d]"
        />
      </div>
      <button className="w-full bg-[#800a0d] text-white py-4 rounded-2xl font-black text-sm uppercase shadow-xl hover:rounded-lg transition-all">
        Cập nhật mật khẩu
      </button>
    </form>
  </div>
);

const ActivityHistory = () => (
  <div className="p-8 bg-white border border-gray-100 shadow-2xl rounded-[40px] animate-fadeIn">
    <div className="flex items-center gap-4 pb-6 mb-8 border-b border-gray-200 border-dashed">
      <div className="w-12 h-12 bg-[#fdfaf5] rounded-xl flex items-center justify-center text-[#800a0d] shadow-sm">
        <History size={24} />
      </div>
      <h2 className="text-2xl font-black text-[#800a0d] uppercase tracking-tighter">
        Lịch sử hoạt động
      </h2>
    </div>
    <div className="py-16 text-center">
      <History size={48} className="mx-auto text-gray-100 mb-4" />
      <p className="text-gray-400 font-bold italic">
        Chưa có hoạt động nào được ghi lại.
      </p>
    </div>
  </div>
);

export default AccountPage;
