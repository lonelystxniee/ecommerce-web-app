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
} from "lucide-react";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);

  // --- BỘ LỌC THỜI GIAN THỰC TẾ ---
  const today = new Date().toISOString().split("T")[0];
  const lastMonth = new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .split("T")[0];
  const [dateRange, setDateRange] = useState({ start: lastMonth, end: today });
  const [globalSearch, setGlobalSearch] = useState("");
  const [timeRange, setTimeRange] = useState("DAY"); // DAY (Ngày), WEEK (Tuần), MONTH (Tháng), YEAR (Năm)

  // States cho Đơn hàng
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);

  // States cho Thành viên
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);

  const itemsPerPage = 5;

  const fetchData = async () => {
    setLoading(true);
    try {
      // FIX LỖI: Gọi thêm API khuyến mãi ở đây
      const [resO, resU, resP, resPromo] = await Promise.all([
        fetch("http://localhost:5175/api/orders/all"),
        fetch("http://localhost:5175/api/auth/users"),
        fetch("http://localhost:5175/api/products"),
        fetch("http://localhost:5175/api/promotions/all"), // Dòng này quan trọng
      ]);

      const dO = await resO.json();
      const dU = await resU.json();
      const dP = await resP.json();
      const dPromo = await resPromo.json();

      if (dO.success) setOrders(dO.orders);
      if (dU.success) setUsers(dU.users);
      if (dP.success) setProducts(dP.products);
      if (dPromo.success) setPromotions(dPromo.promos); // Cập nhật voucher vào giao diện
    } catch (e) {
      console.error("Lỗi tải dữ liệu Dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // --- LOGIC BIỂU ĐỒ DOANH THU CHI TIẾT ---
  const barChartData = useMemo(() => {
    const completed = filteredByDateOrders.filter((o) =>
      ["COMPLETED", "DELIVERED"].includes(o.status?.toUpperCase()),
    );

    // 1. PHÂN TÍCH THEO TỪNG NGÀY CỤ THỂ (Thay cho "Thứ")
    if (timeRange === "DAY") {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      const data = [];

      // Chạy vòng lặp từ ngày bắt đầu đến ngày kết thúc
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split("T")[0];
        const displayLabel = `${d.getDate()}/${d.getMonth() + 1}`; // Định dạng VD: 04/03

        const total = completed
          .filter(
            (o) =>
              new Date(o.createdAt).toISOString().split("T")[0] === dateKey,
          )
          .reduce((sum, o) => sum + o.totalPrice, 0);

        data.push({ name: displayLabel, total });
      }
      return data;
    }

    // 2. PHÂN TÍCH THEO TUẦN TRONG THÁNG
    if (timeRange === "WEEK") {
      const weeks = ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"].map((n) => ({
        name: n,
        total: 0,
      }));
      completed.forEach((o) => {
        const dayOfMonth = new Date(o.createdAt).getDate();
        const idx = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
        weeks[idx].total += o.totalPrice;
      });
      return weeks;
    }

    // 3. PHÂN TÍCH THEO THÁNG TRONG NĂM
    if (timeRange === "MONTH") {
      const months = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ].map((n) => ({ name: n, total: 0 }));
      completed.forEach((o) => {
        const monthIdx = new Date(o.createdAt).getMonth();
        months[monthIdx].total += o.totalPrice;
      });
      return months;
    }

    // 4. PHÂN TÍCH THEO CÁC NĂM
    if (timeRange === "YEAR") {
      const yearMap = completed.reduce((acc, o) => {
        const y = new Date(o.createdAt).getFullYear();
        acc[y] = (acc[y] || 0) + o.totalPrice;
        return acc;
      }, {});
      return Object.keys(yearMap)
        .sort()
        .map((y) => ({ name: y, total: yearMap[y] }));
    }

    return [];
  }, [filteredByDateOrders, dateRange, timeRange]);

  // --- LOGIC 2: SẢN PHẨM BÁN CHẠY NHẤT ---
  const bestSellers = useMemo(() => {
    const stats = filteredByDateOrders.reduce((acc, o) => {
      if (["COMPLETED", "DELIVERED"].includes(o.status?.toUpperCase())) {
        o.items.forEach((item) => {
          if (!acc[item.name])
            acc[item.name] = {
              name: item.name,
              img: item.image,
              qty: 0,
            };
          acc[item.name].qty += item.quantity;
        });
      }
      return acc;
    }, {});
    return Object.values(stats)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredByDateOrders]);

  // --- CẢNH BÁO KHO ---
  const lowStockProducts = products
    .filter((p) => p.variants?.some((v) => v.stock < 15))
    .slice(0, 4);

  // --- KHÁCH HÀNG THÂN THIẾT THEO KỲ ---
  const loyalCustomers = useMemo(() => {
    const stats = filteredByDateOrders.reduce((acc, o) => {
      if (["COMPLETED", "DELIVERED"].includes(o.status?.toUpperCase())) {
        const email = o.customerInfo?.email;
        if (email) {
          if (!acc[email])
            acc[email] = { name: o.customerInfo.fullName, total: 0, count: 0 };
          acc[email].total += o.totalPrice;
          acc[email].count += 1;
        }
      }
      return acc;
    }, {});
    return Object.values(stats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [filteredByDateOrders]);

  const totalRevenue = filteredByDateOrders
    .filter((o) => ["COMPLETED", "DELIVERED"].includes(o.status?.toUpperCase()))
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  // --- PHÂN TRANG ĐƠN HÀNG ---
  const finalFilteredOrders = useMemo(() => {
    return filteredByDateOrders.filter((o) => {
      const searchTerm = orderSearch.toLowerCase();
      return (
        o._id.toLowerCase().includes(searchTerm) ||
        o.customerInfo?.fullName?.toLowerCase().includes(searchTerm) ||
        o.customerInfo?.phone?.includes(searchTerm) // Tìm theo số điện thoại (nếu có)
      );
    });
  }, [filteredByDateOrders, orderSearch]);

  // Cập nhật lại currentOrders để dùng mảng đã lọc
  const currentOrders = finalFilteredOrders.slice(
    (orderPage - 1) * itemsPerPage,
    orderPage * itemsPerPage,
  );

  // --- PHÂN TRANG THÀNH VIÊN ---
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
            className="bg-transparent text-[10px] font-black outline-none"
          />
          <span className="text-gray-400 font-bold px-1">~</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="bg-transparent text-[10px] font-black outline-none"
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
          to="/orders"
          label="Doanh thu kỳ này"
          val={`${(totalRevenue / 1000).toFixed(0)}K`}
          icon={<DollarSign />}
          color="bg-orange-50"
          text="text-[#f39200]"
        />
        <StatCard
          to="/orders"
          label="Đơn hàng kỳ này"
          val={filteredByDateOrders.length}
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
                  formatter={(v) => [
                    `${v.toLocaleString()}đ`,
                    "Tổng doanh thu",
                  ]}
                />
                <Bar
                  dataKey="total"
                  radius={[10, 10, 0, 0]}
                  barSize={timeRange === "DAY" ? 25 : 45}
                >
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={index % 2 === 0 ? "#9d0b0f" : "#f39200"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-4 rounded-4xl border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-800">
            <Star size={16} />
            Top bán chạy
          </h3>

          <div className="space-y-2">
            {bestSellers.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 border-b last:border-b-0"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src={p.img} className="w-8 h-8 object-contain" alt="" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">Đã bán: {p.qty}</p>
                </div>

                <Trophy size={14} className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. TABLES SECTION */}
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
                    {o.customerInfo.fullName}
                  </td>
                  <td className="py-4 text-right font-black">
                    {o.totalPrice.toLocaleString()}đ
                  </td>
                  <td className="py-4 text-center">
                    <span
                      className={`text-[8px] font-black uppercase px-2 py-1 rounded-md bg-orange-50 text-[#f39200]`}
                    >
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
                    <div className="w-7 h-7 rounded-full bg-[#9d0b0f] text-white flex items-center justify-center font-black text-[10px] shadow-sm">
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

      {/* 4. VOUCHER HUB (4 COLS) - ĐÃ FIX LỖI HIỂN THỊ */}
      <div className="lg:col-span-4 bg-white p-8 rounded-[40px] shadow-sm border border-stone-100 flex flex-col">
        <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2 text-[#f39200]">
          <Ticket size={20} className="text-[#9d0b0f]" /> Voucher Hub
        </h3>
        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {promotions
            .filter((p) => p.status === "ACTIVE")
            .slice(0, 4)
            .map((promo, idx) => (
              <div
                key={idx}
                className="bg-[#f7f4ef]/50 p-4 rounded-3xl border border-dashed border-[#9d0b0f]/20 hover:border-[#f39200] transition-colors group"
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-black text-[#9d0b0f] text-sm tracking-widest uppercase">
                    {promo.code}
                  </p>
                  <div className="text-[8px] font-black text-gray-400">
                    {promo.usedCount}/{promo.usageLimit}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-bold mb-3 line-clamp-1">
                  {promo.description || "Ưu đãi ClickGo"}
                </p>
                <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-[#f39200] h-full"
                    style={{
                      width: `${(promo.usedCount / promo.usageLimit) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          {promotions.length === 0 && (
            <p className="text-xs text-gray-400 italic text-center py-10">
              Chưa có khuyến mãi nào
            </p>
          )}
        </div>
        <Link
          to="/promotions"
          className="mt-4 text-center text-[10px] font-black text-[#88694f] uppercase tracking-widest hover:text-[#9d0b0f] underline"
        >
          Quản lý khuyến mãi
        </Link>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatCard = ({ label, val, icon, color, text, to }) => (
  <Link
    to={to}
    className="bg-white p-6 rounded-[32px] border border-[#9d0b0f]/5 hover:border-[#f39200] transition-all shadow-sm group cursor-pointer block"
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
