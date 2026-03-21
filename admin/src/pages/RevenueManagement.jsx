import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Radio,
  Plus,
  Loader2,
  Clock,
  X,
  ArrowUpRight,
  Layout,
  MessageSquare,
  ChevronDown,
  Filter,
  Info,
  User,
  CreditCard,
  Calendar as CalIcon,
  Tag,
  ListOrdered,
  Trash2,
  Search,
  ArrowUpDown,
  // Thêm icon cho phân trang
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import toast from "react-hot-toast";

const RevenueManagement = () => {
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("this_month");
  const [historyTab, setHistoryTab] = useState("all");
  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- STATE TÌM KIẾM & LỌC MỚI ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | high | low

  const [stats, setStats] = useState({
    totalOrderRev: 0,
    totalAdRev: 0,
    combinedTotal: 0,
    orderCount: 0,
  });
  const [allTransactions, setAllTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [systemAds, setSystemAds] = useState([]);

  const [adForm, setAdForm] = useState({
    amount: "",
    source: "",
    adId: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const API_URL = "http://localhost:5175";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
    fetchSystemAds();
  }, [filterDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/revenue/report?range=${filterDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setAllTransactions(data.transactions);
        setChartData(data.chartData);
      }
    } catch (error) {
      toast.error("Lỗi tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemAds = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ads`);
      const data = await res.json();
      if (data.success) {
        setSystemAds(
          data.ads.filter((ad) => ad.type === "sidebar" || ad.type === "popup"),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- LOGIC LỌC VÀ TÌM KIẾM CHI TIẾT ---
  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions];

    // 1. Lọc theo Tab (All/Order/Ad)
    if (historyTab !== "all") {
      result = result.filter((item) => item.type.toLowerCase() === historyTab);
    }

    // 2. Lọc theo Từ khóa tìm kiếm (Mã hoặc Tên)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.id.toLowerCase().includes(term) ||
          item.source.toLowerCase().includes(term),
      );
    }

    // 3. Lọc theo Khoảng giá
    if (priceRange.min !== "") {
      result = result.filter((item) => item.amount >= Number(priceRange.min));
    }
    if (priceRange.max !== "") {
      result = result.filter((item) => item.amount <= Number(priceRange.max));
    }

    // 4. Sắp xếp
    result.sort((a, b) => {
      const dateA = new Date(a.rawDate || a.date);
      const dateB = new Date(b.rawDate || b.date);
      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "high") return b.amount - a.amount;
      if (sortBy === "low") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [allTransactions, historyTab, searchTerm, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, historyTab, priceRange, sortBy]);

  const handleAddAdRevenue = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/revenue/ad-revenue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã lưu doanh thu quảng cáo!");
        setShowAdModal(false);
        setAdForm({
          amount: "",
          source: "",
          adId: "",
          date: new Date().toISOString().split("T")[0],
          note: "",
        });
        fetchData();
      }
    } catch (error) {
      toast.error("Lỗi lưu dữ liệu");
    }
  };

  const handleDeleteAdRevenue = async (e, item) => {
    e.stopPropagation();
    if (!window.confirm(`Xóa khoản thu "${item.source}"?`)) return;
    try {
      const res = await fetch(
        `${API_URL}/api/admin/revenue/ad-revenue/${item._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa giao dịch!");
        fetchData();
        if (selectedDetail?._id === item._id) setSelectedDetail(null);
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans text-[#3e2714]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#9d0b0f] uppercase tracking-tight">
            Quản lý Doanh thu
          </h1>
          <p className="text-gray-500 text-sm italic font-medium">
            Báo cáo chi tiết luồng tiền hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white border-2 border-stone-200 text-sm rounded-2xl px-4 py-3 outline-none focus:border-[#9d0b0f] font-bold shadow-sm"
          >
            <option value="today">Hôm nay</option>
            <option value="this_week">7 ngày gần đây</option>
            <option value="this_month">Tháng này</option>
          </select>
          <button
            onClick={() => setShowAdModal(true)}
            className="bg-[#9d0b0f] hover:bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} /> Nhập Thu QC
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Tổng Thu Nhập"
          value={formatCurrency(stats.combinedTotal)}
          icon={<DollarSign className="text-white" />}
          sub="Hợp nhất đơn hàng & QC"
          bgColor="bg-gradient-to-br from-[#9d0b0f] to-[#f39200]"
          textColor="text-white"
        />
        <StatCard
          to="/orders"
          title="Doanh thu Đơn hàng"
          value={formatCurrency(stats.totalOrderRev)}
          icon={<ShoppingBag className="text-[#9d0b0f]" />}
          sub={`${stats.orderCount} đơn hoàn tất`}
          bgColor="bg-white"
          textColor="text-[#3e2714]"
        />
        <StatCard
          title="Doanh thu Quảng cáo"
          value={formatCurrency(stats.totalAdRev)}
          icon={<Radio className="text-[#f39200]" />}
          sub="Hệ thống Sidebar & Popup"
          bgColor="bg-white"
          textColor="text-[#3e2714]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Biểu đồ */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[44px] shadow-sm border border-stone-100">
          <h3 className="font-black text-[#3e2714] uppercase text-xs mb-8 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#9d0b0f]" /> Phân tích tăng
            trưởng
          </h3>
          <div className="w-full h-[350px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorOrder" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9d0b0f" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#9d0b0f" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f39200" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f39200" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}tr`
                        : val.toLocaleString()
                    }
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "15px", border: "none" }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="order"
                    name="Tiền hàng"
                    stroke="#9d0b0f"
                    fill="url(#colorOrder)"
                    strokeWidth={4}
                  />
                  <Area
                    type="monotone"
                    dataKey="ad"
                    name="Tiền QC"
                    stroke="#f39200"
                    fill="url(#colorAd)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic font-medium">
                <Loader2 className="animate-spin mr-2" /> Đang tải dữ liệu...
              </div>
            )}
          </div>
        </div>

        {/* Lịch sử dòng tiền với PHÂN TRANG */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[44px] shadow-sm border border-stone-100 flex flex-col min-h-[650px] max-h-[650px]">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#3e2714] uppercase text-xs flex items-center gap-2">
                <Clock size={18} className="text-[#9d0b0f]" /> Lịch sử dòng tiền
              </h3>
              <div className="flex bg-stone-100 p-1 rounded-xl">
                {["all", "order", "ad"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHistoryTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${historyTab === tab ? "bg-white text-[#9d0b0f] shadow-sm" : "text-gray-400"}`}
                  >
                    {tab === "all"
                      ? "Tất cả"
                      : tab === "order"
                        ? "Đơn hàng"
                        : "QC"}
                  </button>
                ))}
              </div>
            </div>

            {/* THANH TÌM KIẾM VÀ NÚT MỞ BỘ LỌC */}
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#9d0b0f]"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Mã đơn, tên khách..."
                  className="w-full bg-stone-50 border border-stone-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:border-[#9d0b0f] transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`p-2.5 rounded-xl border transition-all ${showFilterPanel ? "bg-[#3e2714] text-white border-[#3e2714]" : "bg-white border-stone-100 text-[#3e2714] hover:bg-stone-50 shadow-sm"}`}
              >
                <Filter size={18} />
              </button>
            </div>

            {/* PANEL LỌC NÂNG CAO */}
            {showFilterPanel && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 animate-fadeIn space-y-4 shadow-inner">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-stone-400 ml-1">
                      Số tiền tối thiểu
                    </label>
                    <input
                      type="number"
                      placeholder="0đ"
                      className="w-full bg-white border-none rounded-lg p-2 text-xs font-bold outline-none"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-stone-400 ml-1">
                      Số tiền tối đa
                    </label>
                    <input
                      type="number"
                      placeholder="99.999.999đ"
                      className="w-full bg-white border-none rounded-lg p-2 text-xs font-bold outline-none"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-stone-400 ml-1">
                    Sắp xếp theo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { k: "newest", v: "Mới nhất" },
                      { k: "oldest", v: "Cũ nhất" },
                      { k: "high", v: "Giá cao nhất" },
                      { k: "low", v: "Giá thấp nhất" },
                    ].map((item) => (
                      <button
                        key={item.k}
                        onClick={() => setSortBy(item.k)}
                        className={`py-2 px-1 rounded-lg text-[9px] font-black uppercase border transition-all ${sortBy === item.k ? "bg-[#3e2714] text-white border-[#3e2714]" : "bg-white border-stone-100 text-stone-400"}`}
                      >
                        {item.v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LIST TRANSACTIONS (HIỂN THỊ PAGINATED) */}
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedDetail(item)}
                  className="flex items-center justify-between p-4 rounded-[24px] border border-transparent hover:border-stone-200 hover:bg-white hover:shadow-xl hover:shadow-stone-200/30 cursor-pointer transition-all group relative"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${item.type === "ORDER" ? "bg-red-50 text-[#9d0b0f]" : "bg-orange-50 text-[#f39200]"}`}
                    >
                      {item.type === "ORDER" ? (
                        <ShoppingBag size={20} />
                      ) : (
                        <Radio size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#3e2714] uppercase tracking-tighter leading-none mb-1">
                        {item.id}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-[#3e2714] leading-none mb-1">
                        {formatCurrency(item.amount)}
                      </p>
                      <span
                        className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${item.type === "ORDER" ? "bg-red-100 text-[#9d0b0f]" : "bg-orange-100 text-[#f39200]"}`}
                      >
                        {item.type === "ORDER" ? "Hàng hóa" : "Quảng cáo"}
                      </span>
                    </div>
                    <div className="w-8 flex justify-end">
                      {item.type === "AD" && (
                        <button
                          onClick={(e) => handleDeleteAdRevenue(e, item)}
                          className="p-2 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                <Search size={40} className="mb-2 mx-auto" />
                <p className="text-[10px] uppercase font-black tracking-widest">
                  Không tìm thấy kết quả
                </p>
              </div>
            )}
          </div>

          {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-stone-50 mt-4 bg-white/50 backdrop-blur-sm">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2.5 rounded-xl border border-stone-100 text-stone-400 hover:bg-[#9d0b0f] hover:text-white disabled:opacity-20 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-[10px] font-black uppercase tracking-widest text-[#88694f]">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2.5 rounded-xl border border-stone-100 text-stone-400 hover:bg-[#9d0b0f] hover:text-white disabled:opacity-20 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODALS DETAIL & ADD AD REVENUE (Giữ nguyên) */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#f7f4ef] w-full max-w-md rounded-[44px] overflow-hidden shadow-2xl border-2 border-[#3e2714] animate-zoomIn">
            <div
              className={`p-8 text-white flex justify-between items-center ${selectedDetail.type === "ORDER" ? "bg-[#9d0b0f]" : "bg-[#3e2714]"}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {selectedDetail.type === "ORDER" ? (
                    <ShoppingBag size={24} />
                  ) : (
                    <Radio size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase">
                    Chi tiết thu nhập
                  </h3>
                  <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">
                    {selectedDetail.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="hover:rotate-90 transition-transform"
              >
                <X />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm text-center">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
                  Số tiền ghi nhận
                </p>
                <p className="text-3xl font-black text-[#3e2714]">
                  {formatCurrency(selectedDetail.amount)}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <DetailItem
                  icon={<CalIcon size={16} />}
                  label="Thời gian"
                  value={selectedDetail.date}
                />
                <DetailItem
                  icon={<Tag size={16} />}
                  label="Nguồn thu"
                  value={selectedDetail.source}
                />
                {selectedDetail.type === "ORDER" ? (
                  <>
                    <DetailItem
                      icon={<User size={16} />}
                      label="Khách hàng"
                      value={selectedDetail.source}
                    />
                    <DetailItem
                      icon={<CreditCard size={16} />}
                      label="Thanh toán"
                      value="Chuyển khoản / COD"
                    />
                  </>
                ) : (
                  <>
                    <DetailItem
                      icon={<Layout size={16} />}
                      label="Vị trí hiển thị"
                      value="Sidebar / Popup"
                    />
                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                      <p className="text-[9px] font-black text-orange-400 uppercase mb-2">
                        Ghi chú từ Admin
                      </p>
                      <p className="text-xs font-bold text-[#3e2714]">
                        {selectedDetail.note || "Không có ghi chú."}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="w-full py-4 rounded-full bg-[#3e2714] text-white font-black uppercase text-xs tracking-widest hover:bg-black transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#f7f4ef] w-full max-w-lg rounded-[44px] overflow-hidden shadow-2xl border-2 border-[#9d0b0f] animate-zoomIn">
            <div className="bg-[#9d0b0f] p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase">
                  Ghi nhận doanh thu QC
                </h3>
                <p className="text-[10px] font-bold opacity-60 uppercase">
                  Hệ thống Sidebar & Popup
                </p>
              </div>
              <button onClick={() => setShowAdModal(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={handleAddAdRevenue} className="p-10 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#88694f] uppercase tracking-widest">
                  Chọn quảng cáo hệ thống
                </label>
                <select
                  className="w-full bg-white border-2 border-stone-100 rounded-2xl p-4 font-bold text-sm outline-none"
                  value={adForm.adId}
                  onChange={(e) => {
                    const selected = systemAds.find(
                      (ad) => ad._id === e.target.value,
                    );
                    setAdForm({
                      ...adForm,
                      adId: e.target.value,
                      source: selected ? selected.title : "",
                    });
                  }}
                >
                  <option value="">-- Chọn từ danh sách --</option>
                  {systemAds.map((ad) => (
                    <option key={ad._id} value={ad._id}>
                      [{ad.type.toUpperCase()}] {ad.title}
                    </option>
                  ))}
                  <option value="other">Khác</option>
                </select>
              </div>
              <input
                type="text"
                required
                placeholder="Tên nguồn thu..."
                className="w-full bg-white border-2 border-stone-100 rounded-2xl p-4 font-bold text-sm outline-none"
                value={adForm.source}
                onChange={(e) =>
                  setAdForm({ ...adForm, source: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  required
                  placeholder="Số tiền..."
                  className="w-full bg-white border-2 border-stone-100 rounded-2xl p-4 font-black text-lg text-[#9d0b0f] outline-none"
                  value={adForm.amount}
                  onChange={(e) =>
                    setAdForm({ ...adForm, amount: e.target.value })
                  }
                />
                <input
                  type="date"
                  className="w-full bg-white border-2 border-stone-100 rounded-2xl p-4 text-sm font-bold"
                  value={adForm.date}
                  onChange={(e) =>
                    setAdForm({ ...adForm, date: e.target.value })
                  }
                />
              </div>
              <textarea
                rows="2"
                className="w-full bg-white border-2 border-stone-100 rounded-2xl p-4 text-sm font-medium outline-none"
                placeholder="Ghi chú..."
                value={adForm.note}
                onChange={(e) => setAdForm({ ...adForm, note: e.target.value })}
              />
              <button
                type="submit"
                className="w-full bg-[#9d0b0f] text-white py-5 rounded-full font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all"
              >
                Lưu vào báo cáo
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; }.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; } @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; } @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }`}</style>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-stone-200">
    <div className="flex items-center gap-3 text-stone-400">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}
      </span>
    </div>
    <span className="text-sm font-black text-[#3e2714] uppercase">{value}</span>
  </div>
);

const StatCard = ({ title, value, icon, sub, bgColor, textColor }) => (
  <div
    className={`${bgColor} p-8 rounded-[44px] shadow-sm border border-stone-100 transition-all hover:translate-y-[-5px] group`}
  >
    <div className="flex items-center justify-between mb-6">
      <div
        className={`p-3 rounded-2xl ${bgColor.includes("gradient") ? "bg-white/20" : "bg-stone-50"}`}
      >
        {icon}
      </div>
      <ArrowUpRight
        size={20}
        className={`${textColor} opacity-40 group-hover:opacity-100`}
      />
    </div>
    <p
      className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-60 ${textColor}`}
    >
      {title}
    </p>
    <p className={`text-3xl font-black tracking-tighter mb-2 ${textColor}`}>
      {value}
    </p>
    <p
      className={`text-[11px] font-bold uppercase tracking-tighter opacity-40 ${textColor}`}
    >
      {sub}
    </p>
  </div>
);

export default RevenueManagement;
