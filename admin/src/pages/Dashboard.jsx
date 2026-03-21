import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Search,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trophy,
  ArrowUpRight,
  LayoutGrid,
  UserCheck,
  Calendar as CalendarIcon,
  Bell,
  Search as SearchIcon,
  Star,
  Ticket,
  Loader2,
} from "lucide-react";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [revenueData, setRevenueData] = useState({
    combinedTotal: 0,
    orderCount: 0,
  });

  const [apiChartData, setApiChartData] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

  // --- BỘ LỌC THỜI GIAN THỰC TẾ ---
  const today = new Date().toISOString().split("T")[0];
  const lastMonth = new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .split("T")[0];

  const [dateRange, setDateRange] = useState({ start: lastMonth, end: today });
  const [chartDateRange, setChartDateRange] = useState({ start: lastMonth, end: today });
  const [globalSearch, setGlobalSearch] = useState("");
  const [timeRange, setTimeRange] = useState("DAY");

  // States cho Đơn hàng/Thành viên/Voucher
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [voucherSearch, setVoucherSearch] = useState("");
  const [voucherPage, setVoucherPage] = useState(1);

  const itemsPerPage = 5;
  const vouchersPerPage = 4;

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resO, resU, resP, resPromo, resRev] = await Promise.all([
        fetch(`${API_URL}/api/orders/all`),
        fetch(`${API_URL}/api/auth/users`, { headers }),
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/promotions/all`),
        fetch(`${API_URL}/api/admin/revenue/report?range=this_year`, { headers }),
      ]);

      const dO = await resO.json();
      const dU = await resU.json();
      const dP = await resP.json();
      const dPromo = await resPromo.json();
      const dRev = await resRev.json();

      if (dO.success) setOrders(dO.orders);
      if (dU.success) setUsers(dU.users);
      if (dP.success) setProducts(dP.products);
      if (dPromo.success) setPromotions(dPromo.promos);

      if (dRev.success) {
        setRevenueData(dRev.stats);
        const processedChart = dRev.chartData.map((item) => ({
          name: item.name,
          order: Number(item.order) || 0,
          ad: Number(item.ad) || 0,
        }));

        if (timeRange === "WEEK") {
          const weeks = [
            { name: "Tuần 1", order: 0, ad: 0 },
            { name: "Tuần 2", order: 0, ad: 0 },
            { name: "Tuần 3", order: 0, ad: 0 },
            { name: "Tuần 4", order: 0, ad: 0 },
          ];
          processedChart.forEach((item, idx) => {
            const weekIdx = Math.min(3, Math.floor(idx / 7));
            weeks[weekIdx].order += item.order;
            weeks[weekIdx].ad += item.ad;
          });
          setApiChartData(weeks);
        } else {
          setApiChartData(processedChart);
        }
      }
    } catch (e) {
      console.error("Lỗi tải dữ liệu Dashboard:", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // --- HÀM LỌC ĐƠN HÀNG THEO LỊCH ĐÃ CHỌN ---
  const filteredByDateOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
      const matchesDate =
        orderDate >= dateRange.start && orderDate <= dateRange.end;
      const matchesGlobal =
        order.customerInfo?.fullName
          ?.toLowerCase()
          .includes(globalSearch.toLowerCase()) ||
        order._id.includes(globalSearch);
      return matchesDate && matchesGlobal;
    });
  }, [orders, dateRange, globalSearch]);

  // LOGIC BIỂU ĐỒ DOANH THU
  const chartOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
      return (
        orderDate >= chartDateRange.start && orderDate <= chartDateRange.end
      );
    });
  }, [orders, chartDateRange]);

  const barChartData = useMemo(() => {
    const completed = chartOrders.filter((o) =>
      ["COMPLETED", "DELIVERED"].includes(o.status?.toUpperCase()),
    );

    if (timeRange === "DAY") {
      const start = new Date(chartDateRange.start);
      const end = new Date(chartDateRange.end);
      const data = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split("T")[0];
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        const order = completed
          .filter(
            (o) =>
              new Date(o.createdAt).toISOString().split("T")[0] === dateKey,
          )
          .reduce((sum, o) => sum + o.totalPrice, 0);

        data.push({
          name: label,
          order,
          ad: 0,
        });
      }
      return data;
    }

    if (timeRange === "WEEK") {
      const weeks = [
        { name: "Tuần 1", order: 0, ad: 0 },
        { name: "Tuần 2", order: 0, ad: 0 },
        { name: "Tuần 3", order: 0, ad: 0 },
        { name: "Tuần 4", order: 0, ad: 0 },
      ];

      completed.forEach((o) => {
        const day = new Date(o.createdAt).getDate();
        const idx = Math.min(3, Math.floor((day - 1) / 7));
        weeks[idx].order += o.totalPrice;
      });
      return weeks;
    }

    if (timeRange === "MONTH") {
      const months = Array.from({ length: 12 }, (_, i) => ({
        name: `Tháng ${i + 1}`,
        order: 0,
        ad: 0,
      }));

      completed.forEach((o) => {
        const m = new Date(o.createdAt).getMonth();
        months[m].order += o.totalPrice;
      });
      return months;
    }

    if (timeRange === "YEAR") {
      const yearMap = {};

      completed.forEach((o) => {
        const y = new Date(o.createdAt).getFullYear();
        yearMap[y] = (yearMap[y] || 0) + o.totalPrice;
      });

      return Object.keys(yearMap)
        .sort()
        .map((y) => ({
          name: y,
          order: yearMap[y],
          ad: 0,
        }));
    }

    return [];
  }, [chartOrders, timeRange, chartDateRange]);

  const bestSellers = useMemo(() => {
    const stats = filteredByDateOrders.reduce((acc, o) => {
      if (["COMPLETED", "DELIVERED"].includes(o.status?.toUpperCase())) {
        o.items.forEach((item) => {
          if (!acc[item.name])
            acc[item.name] = { name: item.name, img: item.image, qty: 0 };
          acc[item.name].qty += item.quantity;
        });
      }
      return acc;
    }, {});
    return Object.values(stats)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredByDateOrders]);

  const totalRevenue = filteredByDateOrders
    .filter((o) => ["COMPLETED", "DELIVERED"].includes(o.status?.toUpperCase()))
    .reduce((acc, curr) => acc + curr.totalPrice, 0);
  const finalFilteredOrders = useMemo(() => {
    return filteredByDateOrders.filter((o) => {
      const searchTerm = orderSearch.toLowerCase();
      return (
        o._id.toLowerCase().includes(searchTerm) ||
        o.customerInfo?.fullName?.toLowerCase().includes(searchTerm) ||
        o.customerInfo?.phone?.includes(searchTerm)
      );
    });
  }, [filteredByDateOrders, orderSearch]);

  const currentOrders = finalFilteredOrders.slice(
    (orderPage - 1) * itemsPerPage,
    orderPage * itemsPerPage,
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const searchTerm = userSearch.toLowerCase();
      return (
        u.fullName?.toLowerCase().includes(searchTerm) ||
        u.email?.toLowerCase().includes(searchTerm) ||
        u.role?.toLowerCase().includes(searchTerm)
      );
    });
  }, [users, userSearch]);

  const currentUsers = filteredUsers.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage,
  );
  const filteredVouchers = useMemo(() => {
    return promotions.filter((p) =>
      p.code.toLowerCase().includes(voucherSearch.toLowerCase()),
    );
  }, [promotions, voucherSearch]);

  const currentVouchers = filteredVouchers.slice(
    (voucherPage - 1) * vouchersPerPage,
    voucherPage * vouchersPerPage,
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-10 text-[#3e2714]">
      {/* 1. TOP GLOBAL BAR */}
      <div className="sticky top-0 z-[100] flex flex-col xl:flex-row items-center gap-4 bg-white/90 backdrop-blur-md p-4 rounded-[28px] shadow-xl border border-[#9d0b0f]/5">
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-[#9d0b0f] p-2.5 rounded-xl text-white shadow-lg shadow-red-100">
            <LayoutGrid size={22} />
          </div>
          <h2 className="text-xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            ClickGo
          </h2>
        </div>

        <div className="flex-1 relative group w-full">
          <SearchIcon
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9d0b0f]"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh đơn hàng, khách hàng..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-[#f7f4ef] border-2 border-transparent focus:border-[#f39200] focus:bg-white py-2.5 pl-12 pr-4 rounded-2xl outline-none font-bold text-xs transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 bg-[#f7f4ef] p-1.5 rounded-2xl border border-stone-200 shrink-0">
          <CalendarIcon size={14} className="text-[#9d0b0f] ml-2" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="bg-transparent text-[10px] font-black outline-none cursor-pointer"
          />
          <span className="text-gray-400 font-bold px-1">~</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="bg-transparent text-[10px] font-black outline-none cursor-pointer"
          />
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 bg-white border border-[#9d0b0f]/10 rounded-xl text-[#9d0b0f] hover:bg-red-50"
        >
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          to="/revenue"
          label="Tổng doanh thu kỳ này"
          val={new Intl.NumberFormat("vi-VN").format(revenueData.combinedTotal) + "đ"}
          icon={<DollarSign />}
          color="bg-orange-50"
          text="text-[#f39200]"
        />
        <StatCard
          to="/orders"
          label="Đơn hàng kỳ này"
          val={revenueData.orderCount}
          icon={<ShoppingCart />}
          color="bg-red-50"
          text="text-[#9d0b0f]"
        />
        <StatCard
          to="/users"
          label="Thành viên"
          val={users.length}
          icon={<Users />}
          color="bg-blue-50"
          text="text-blue-600"
        />
        <StatCard
          to="/products"
          label="Sản phẩm"
          val={products.length}
          icon={<Package />}
          color="bg-emerald-50"
          text="text-emerald-600"
        />
      </div>

      {/* 3. BIỂU ĐỒ DOANH THU & TOP BÁN CHẠY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col h-[500px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <h3 className="text-xl font-black uppercase flex items-center gap-2 text-[#9d0b0f]">
              <TrendingUp size={24} /> Biến động doanh thu
            </h3>
            <div className="flex items-center gap-2 bg-[#f7f4ef] p-1 rounded-xl border">
              <CalendarIcon size={14} />
              <input
                type="date"
                value={chartDateRange.start}
                onChange={(e) => setChartDateRange({ ...chartDateRange, start: e.target.value })}
                className="bg-transparent text-[10px] font-bold outline-none"
              />
              <span>~</span>
              <input
                type="date"
                value={chartDateRange.end}
                onChange={(e) => setChartDateRange({ ...chartDateRange, end: e.target.value })}
                className="bg-transparent text-[10px] font-bold outline-none"
              />
            </div>
            <div className="flex bg-[#f7f4ef] p-1 rounded-xl border border-stone-200">
              {[
                { k: "DAY", v: "NGÀY" },
                { k: "WEEK", v: "TUẦN" },
                { k: "MONTH", v: "THÁNG" },
                { k: "YEAR", v: "NĂM" },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTimeRange(t.k)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${timeRange === t.k ? "bg-[#9d0b0f] text-white shadow-lg" : "text-gray-400 hover:text-[#9d0b0f]"}`}
                >
                  {t.v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "800", fill: "#88694f" }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "#f7f4ef" }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value, name) => [
                    `${value.toLocaleString()}đ`,
                    name === "order" ? "Tiền hàng" : "Tiền QC",
                  ]}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar dataKey="order" name="Tiền hàng" stackId="a" fill="#9d0b0f" />
                <Bar dataKey="ad" name="Tiền QC" stackId="a" fill="#f39200" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-4 rounded-[40px] border flex flex-col">
          <h3 className="text-[10px] font-black uppercase mb-3 flex items-center gap-2 text-gray-400 tracking-widest px-4 pt-4">
            <Star size={16} className="text-[#f39200]" /> Top bán chạy
          </h3>
          <div className="space-y-2 flex-1 overflow-auto px-2 custom-scrollbar">
            {bestSellers.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-[#f7f4ef]/50 rounded-2xl border border-stone-100 hover:bg-[#f7f4ef] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm">
                  <img
                    src={p.img}
                    className="max-w-full max-h-full object-contain"
                    alt=""
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {p.name}
                  </p>
                  <p className="text-[10px] font-black text-[#9d0b0f]">
                    Đã bán: {p.qty}
                  </p>
                </div>
                <Trophy size={14} className="text-[#f39200]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TableContainer
          title="Đơn hàng"
          search={orderSearch}
          setSearch={setOrderSearch}
          page={orderPage}
          setPage={setOrderPage}
          total={Math.ceil(filteredByDateOrders.length / 5)}
        >
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 uppercase font-black text-[9px] border-b">
              <tr>
                <th className="pb-3 pl-2">Mã đơn</th>
                <th className="pb-3">Khách</th>
                <th className="pb-3 text-right">Giá</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentOrders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 pl-2 font-bold text-[#9d0b0f]">
                    #{o._id.substring(o._id.length - 4).toUpperCase()}
                  </td>
                  <td className="py-4 font-bold truncate max-w-[120px]">
                    {o.customerInfo?.fullName}
                  </td>
                  <td className="py-4 text-right font-black">
                    {o.totalPrice.toLocaleString()}đ
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-[8px] font-black uppercase px-2 py-1 rounded-md bg-orange-50 text-[#f39200]">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>

        <TableContainer
          title="Thành viên"
          search={userSearch}
          setSearch={setUserSearch}
          page={userPage}
          setPage={setUserPage}
          total={Math.ceil(filteredUsers.length / 5)}
        >
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 uppercase font-black text-[9px] border-b">
              <tr>
                <th className="pb-3 pl-2">Thành viên</th>
                <th className="pb-3">Email</th>
                <th className="pb-3 text-center">Vai trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pl-2 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#9d0b0f] text-white flex items-center justify-center font-black text-[10px] shadow-sm uppercase">
                      {u.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold truncate max-w-[120px]">
                      {u.fullName}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 italic truncate max-w-[120px]">
                    {u.email}
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-[8px] font-black px-2 py-1 rounded-md uppercase bg-green-50 text-green-600">
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100 flex flex-col min-h-[450px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-lg font-black uppercase flex items-center gap-2 text-[#9d0b0f]">
              <Ticket size={24} className="text-[#9d0b0f]" /> Voucher Hub
            </h3>
            <p className="text-[10px] font-bold text-[#88694f] italic mt-1">
              Tìm thấy {filteredVouchers.length} mã giảm giá
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <SearchIcon
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={voucherSearch}
                onChange={(e) => setVoucherSearch(e.target.value)}
                placeholder="Tìm mã code..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#f7f4ef] rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#f39200] transition-all"
              />
            </div>
            <Link
              to="/promotions"
              className="hidden md:block p-2.5 bg-white border border-stone-200 rounded-xl text-[#9d0b0f] hover:bg-red-50"
            >
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
          {currentVouchers.map((promo) => {
            const isOut =
              promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit;
            return (
              <div
                key={promo._id}
                className="bg-white rounded-[32px] shadow-sm border border-stone-100 overflow-hidden hover:shadow-xl transition-all flex flex-col group animate-fadeIn"
              >
                <div
                  className={`p-5 text-white bg-gradient-to-br from-[#9d0b0f] to-[#f39200]`}
                >
                  <h4 className="text-2xl font-black tracking-tighter">
                    {promo.discountType === "AMOUNT"
                      ? `${promo.discountValue / 1000}K`
                      : `${promo.discountValue}%`}
                  </h4>
                  <p className="font-bold text-[12px] uppercase mt-1 tracking-widest truncate">
                    {promo.code}
                  </p>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                      <span>Đã dùng</span>
                      <span
                        className={isOut ? "text-red-500" : "text-[#9d0b0f]"}
                      >
                        {promo.usedCount}/{promo.usageLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f39200]"
                        style={{
                          width: `${Math.min(100, (promo.usedCount / promo.usageLimit) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#88694f] font-bold italic line-clamp-2 mt-3">
                    {promo.description || "Ưu đãi ClickGo"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {Math.ceil(filteredVouchers.length / vouchersPerPage) > 1 && (
          <div className="mt-8 flex justify-center items-center gap-6 pt-6 border-t border-stone-50">
            <button
              disabled={voucherPage === 1}
              onClick={() => setVoucherPage(voucherPage - 1)}
              className="p-2.5 rounded-xl border border-stone-200 text-[#9d0b0f] disabled:opacity-20 hover:bg-red-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[11px] font-black text-[#88694f] uppercase tracking-widest">
              Trang {voucherPage}
            </span>
            <button
              disabled={
                voucherPage >=
                Math.ceil(filteredVouchers.length / vouchersPerPage)
              }
              onClick={() => setVoucherPage(voucherPage + 1)}
              className="p-2.5 rounded-xl border border-stone-200 text-[#9d0b0f] disabled:opacity-20 hover:bg-red-50 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, val, icon, color, text, to }) => (
  <Link
    to={to}
    className="bg-white p-6 rounded-[32px] border border-[#9d0b0f]/5 hover:border-[#f39200] transition-all shadow-sm group block"
  >
    <div className="flex justify-between items-start">
      <div
        className={`w-12 h-12 ${color} ${text} rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform`}
      >
        {icon}
      </div>
      <ArrowUpRight
        size={20}
        className="text-gray-300 group-hover:text-[#f39200]"
      />
    </div>
    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
      {label}
    </p>
    <h3 className="text-2xl font-black text-[#3e2714]">{val}</h3>
    <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-[#88694f] opacity-0 group-hover:opacity-100 transition-opacity">
      Xem chi tiết <ChevronRight size={10} />
    </div>
  </Link>
);

const TableContainer = ({
  title,
  children,
  search,
  setSearch,
  page,
  setPage,
  total,
}) => (
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100 flex flex-col h-[520px]">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-black uppercase tracking-tighter">{title}</h3>
      <div className="relative w-40">
        <SearchIcon
          className="absolute left-3 top-2.5 text-gray-400"
          size={14}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#f7f4ef] rounded-xl text-[10px] outline-none font-bold"
          placeholder="Tìm kiếm"
        />
      </div>
    </div>
    <div className="flex-1 overflow-auto custom-scrollbar">{children}</div>
    <div className="mt-4 flex justify-between items-center pt-4 border-t">
      <span className="text-[10px] font-bold text-gray-400">
        {page}/{total || 1}
      </span>
      <div className="flex gap-1">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="p-1 border rounded-lg hover:bg-gray-50 disabled:opacity-20 transition-all"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          disabled={page >= total}
          onClick={() => setPage(page + 1)}
          className="p-1 border rounded-lg hover:bg-gray-50 disabled:opacity-20 transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  </div>
);

export default Dashboard;
