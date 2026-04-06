import React, { useState, useEffect } from "react";
import {
  Truck,
  Package,
  CheckCircle,
  RefreshCw,
  MapPin,
  Phone,
  Navigation,
  LayoutDashboard,
  History,
  User,
  Search,
  Bell,
  Wifi,
  Battery,
  Signal,
  Clock,
} from "lucide-react";

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("todo"); // todo, history
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!showFilters) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowFilters(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showFilters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5175/api/orders/all");
      const data = await res.json();
      if (data.success) {
        const filtered = data.orders.filter(
          (o) =>
            // Thêm STORING vào danh sách hiển thị
            ["READY_TO_PICK", "PICKING", "STORING", "DELIVERING"].includes(
              o.status,
            ), // Remove the explicit requirement for o.ghnOrderCode since GHN creation may fail
        );
        setOrders(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại API mỗi khi đổi Tab
  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleUpdate = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5175/api/orders/shipper-update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ orderId }),
        },
      );
      const data = await res.json();
      if (res.status === 401) {
        alert('Bạn chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.');
        return;
      }
      if (data.success) {
        alert("Cập nhật hành trình thành công!");
        fetchOrders();
      } else {
        alert(data.message || "Không thể cập nhật trạng thái này!");
      }
    } catch (e) {
      console.log(e);
      alert("Lỗi server!");
    }
  };

  // apply client-side filters
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (amountFilter === "gt100k" && !(o.totalPrice > 100000)) return false;
    if (amountFilter === "lt100k" && !(o.totalPrice <= 100000)) return false;
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase();
      const name = (o.customerInfo.fullName || "").toLowerCase();
      const phone = (o.customerInfo.phone || "").toLowerCase();
      return name.includes(q) || phone.includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 py-10 font-sans">
      <div className="relative mx-auto border-[8px] border-[#333] rounded-[60px] h-[850px] w-[395px] bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-[4px] ring-[#1a1a1a]">
        {/* STATUS BAR */}
        <div className="absolute top-0 w-full h-12 flex justify-between items-center px-8 z-[100] text-white">
          <span className="text-sm font-bold">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <div className="absolute left-1/2 -translate-x-1/2 top-3 w-[120px] h-[35px] bg-black rounded-full border border-white/5"></div>
          <div className="flex items-center gap-1.5">
            <Signal size={14} /> <Wifi size={14} /> <Battery size={18} />
          </div>
        </div>

        {/* APP CONTENT */}
        <div className="h-full w-full bg-[#f4f4f4] overflow-y-auto scrollbar-hide pt-12">
          <header className="bg-gradient-to-r from-[#f26522] to-[#9d0b0f] text-white p-5 pt-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/20 border-white/20">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] opacity-70 font-black uppercase">
                    Giao hàng nhanh
                  </p>
                  <h2 className="text-sm font-black"> Shipper</h2>
                </div>
              </div>
              <button
                onClick={fetchOrders}
                className={loading ? "animate-spin" : ""}
              >
                <RefreshCw size={22} />
              </button>
            </div>
          </header>

          {/* TAB SWITCHER */}
          <div className="flex gap-2 p-4">
            <button
              onClick={() => setActiveTab("todo")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "todo" ? "bg-[#f26522] text-white shadow-md" : "bg-white text-gray-400"}`}
            >
              Đang giao ({activeTab === "todo" ? filteredOrders.length : "..."})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "history" ? "bg-[#f26522] text-white shadow-md" : "bg-white text-gray-400"}`}
            >
              Lịch sử đơn
            </button>
          </div>

          {/* FILTERS TOGGLE + POPUP */}
          <div className="px-4 pb-2 relative">
            <div className="flex justify-between items-center">
              <div />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setStatusFilter("all"); setAmountFilter("all"); setSearchQuery(""); setAppliedSearch(""); }}
                  className={`text-[11px] px-3 py-2 rounded-xl font-bold bg-white text-gray-600`}
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters((s) => !s)}
                  className={`text-[13px] px-3 py-2 rounded-xl font-bold bg-white text-gray-800 shadow-sm flex items-center gap-2`}
                >
                  <Search size={14} />
                  Bộ lọc
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-3 absolute left-4 right-4 bg-white p-4 rounded-xl shadow z-50 border">
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => { setStatusFilter("all"); setAmountFilter("all"); setSearchQuery(""); }}
                    className={`text-[11px] px-3 py-2 rounded-xl font-bold ${statusFilter === "all" && amountFilter === "all" && !searchQuery ? "bg-[#f26522] text-white" : "bg-white text-gray-500"}`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => { setStatusFilter("READY_TO_PICK"); setAmountFilter("all"); }}
                    className={`text-[11px] px-3 py-2 rounded-xl font-bold ${statusFilter === "READY_TO_PICK" ? "bg-[#f26522] text-white" : "bg-white text-gray-500"}`}
                  >
                    Chờ lấy
                  </button>
                  <button
                    onClick={() => { setStatusFilter("PICKING"); setAmountFilter("all"); }}
                    className={`text-[11px] px-3 py-2 rounded-xl font-bold ${statusFilter === "PICKING" ? "bg-[#f26522] text-white" : "bg-white text-gray-500"}`}
                  >
                    Nhập kho
                  </button>
                  <button
                    onClick={() => { setStatusFilter("DELIVERING"); setAmountFilter("all"); }}
                    className={`text-[11px] px-3 py-2 rounded-xl font-bold ${statusFilter === "DELIVERING" ? "bg-[#f26522] text-white" : "bg-white text-gray-500"}`}
                  >
                    Đang giao
                  </button>
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setAmountFilter("all")}
                    className={`text-[11px] px-3 py-2 rounded-xl font-bold ${amountFilter === "all" ? "bg-white text-gray-800 border" : "bg-white text-gray-400"}`}
                  >
                    Tất cả COD
                  </button>
                  <button
                    onClick={() => setAmountFilter("gt100k")}
                    className={`text-[11px] px-3 py-2 rounded-xl font-bold ${amountFilter === "gt100k" ? "bg-[#f26522] text-white" : "bg-white text-gray-400"}`}
                  >
                    COD &gt; 100k
                  </button>
                  <button
                    onClick={() => setAmountFilter("lt100k")}
                    className={`text-[11px] px-3 py-2 rounded-xl font-bold ${amountFilter === "lt100k" ? "bg-[#f26522] text-white" : "bg-white text-gray-400"}`}
                  >
                    COD ≤ 100k
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setAppliedSearch(searchQuery.trim());
                      }
                    }}
                    placeholder="Tìm theo tên hoặc số điện thoại"
                    className="flex-1 text-sm px-3 py-2 rounded-xl border bg-white"
                  />
                  <button
                    onClick={() => setAppliedSearch(searchQuery.trim())}
                    title="Tìm"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600"
                  >
                    <Search size={16} />
                  </button>
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => setShowFilters(false)} className="px-3 py-2 rounded-xl bg-gray-100">Đóng</button>
                  <button onClick={() => { setAppliedSearch(searchQuery.trim()); setShowFilters(false); }} className="px-3 py-2 rounded-xl bg-[#f26522] text-white">Áp dụng</button>
                </div>
              </div>
            )}
          </div>

          {/* LIST ORDERS */}
          <div className="px-4 space-y-4 pb-28">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[32px] border border-dashed text-gray-400">
                <Package size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">Không có đơn hàng nào!</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50/50">
                    <span className="text-[10px] font-black text-[#f26522] uppercase">
                      {order.ghnOrderCode}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-[#f26522]">
                        <User size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">
                          {order.customerInfo.fullName}
                        </h4>
                        <p className="text-xs font-bold text-blue-500">
                          {order.customerInfo.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs font-medium text-gray-500">
                      <MapPin size={16} className="text-red-500 shrink-0" />
                      <p>{order.customerInfo.address}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-dashed">
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">
                          Thu hộ COD
                        </p>
                        <p className="text-lg font-black text-red-600">
                          {(((order.paymentMethod || "").toUpperCase() === "VNPAY") ? 0 : Number(order.totalPrice || 0)).toLocaleString()}đ
                        </p>
                      </div>

                      {/* NÚT BẤM LOGIC ĐỔI CHỮ THEO TRẠNG THÁI */}
                      {activeTab === "todo" && (
                        <button
                          onClick={() => handleUpdate(order._id)}
                          disabled={loading}
                          className={`w-44 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-90 flex items-center justify-center gap-2 shadow-lg text-white
    ${order.status === "READY_TO_PICK"
                              ? "bg-blue-600"
                              : order.status === "PICKING"
                                ? "bg-orange-500"
                                : order.status === "STORING"
                                  ? "bg-purple-600"
                                  : "bg-green-600"
                            }`}
                        >
                          {order.status === "READY_TO_PICK" &&
                            "Xác nhận lấy hàng"}
                          {order.status === "PICKING" && "Nhập kho Mega SOC"}
                          {order.status === "STORING" && "Xuất kho đi giao"}
                          {order.status === "DELIVERING" && "Giao thành công"}
                          <Navigation size={14} fill="white" />
                        </button>
                      )}
                      <div className="flex flex-col items-end gap-2">
                        <label className="text-[11px] text-gray-500">
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const f = e.target.files && e.target.files[0];
                            if (!f) return;
                            const token = localStorage.getItem('token');
                            const fd = new FormData();
                            fd.append('image', f);
                            try {
                              const res = await fetch(`http://localhost:5175/api/orders/${order._id}/images`, {
                                method: 'POST',
                                headers: token ? { Authorization: `Bearer ${token}` } : {},
                                body: fd,
                              });
                              const d = await res.json();
                              if (d.success) {
                                alert('Upload thành công');
                                // optional: refresh list
                              } else alert('Lỗi: ' + (d.message || 'Upload thất bại'))
                            } catch (err) { alert('Lỗi kết nối') }
                          }} />
                          <button onClick={(ev) => { ev.stopPropagation(); const input = ev.currentTarget.previousSibling; input.click(); }} className="px-3 py-2 rounded-xl bg-white text-gray-700 text-xs font-bold">Ảnh</button>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* BOTTOM DOCK */}
          <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur-xl rounded-[30px] flex justify-around p-3 shadow-2xl border border-white/20">
            <button
              onClick={() => setActiveTab("todo")}
              className={`p-3 rounded-2xl ${activeTab === "todo" ? "bg-[#f26522] text-white" : "text-gray-400"}`}
            >
              <LayoutDashboard size={22} />
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`p-3 rounded-2xl ${activeTab === "history" ? "bg-[#f26522] text-white" : "text-gray-400"}`}
            >
              <History size={22} />
            </button>
          </nav>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
