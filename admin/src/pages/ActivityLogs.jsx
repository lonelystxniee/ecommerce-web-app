import React, { useState, useEffect } from "react";
import {
    Activity,
    User,
    Clock,
    Globe,
    Monitor,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Search,
    Filter
} from "lucide-react";

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [sort, setSort] = useState("newest");
    const LIMIT = 15;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", LIMIT);
            if (debouncedSearch) params.append("q", debouncedSearch);
            if (actionFilter) params.append("action", actionFilter);
            if (sort) params.append("sort", sort);

            const res = await fetch(`${API_URL}/api/auth/admin-activities?${params.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setLogs(data.activities);
                setPagination(data.pagination);
            }
        } catch (e) {
            console.error("Error fetching logs:", e);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchLogs(currentPage);
    }, [currentPage, debouncedSearch, actionFilter, sort]);

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        return new Date(dateString).toLocaleString('vi-VN', options);
    };

    // Predefined actions for filter dropdown
    const actions = [
        "Tạo sản phẩm", "Cập nhật sản phẩm", "Xóa sản phẩm", "Nhập Excel sản phẩm",
        "Tạo danh mục", "Cập nhật danh mục", "Xóa danh mục", "Nhập Excel danh mục",
        "Xóa đánh giá", "Đăng nhập", "Cập nhật hồ sơ"
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-[#9d0b0f] pb-4">
                <div>
                    <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
                        Nhật ký hệ thống
                    </h2>
                    <p className="text-[#88694f] italic">
                        Theo dõi mọi hoạt động tác động đến hệ thống
                    </p>
                </div>
                <button
                    onClick={() => fetchLogs(currentPage)}
                    className="p-3 bg-white border-2 border-stone-200 rounded-2xl text-[#9d0b0f] hover:bg-[#9d0b0f] hover:text-white transition-all shadow-sm"
                    title="Làm mới"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* toolbar */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[24px] border border-stone-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm người dùng hoặc chi tiết..."
                        className="pl-10 pr-4 py-2 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#9d0b0f] transition-all w-48 md:w-64 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        value={actionFilter}
                        onChange={(e) => {
                            setActionFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-2 text-sm outline-none focus:border-[#9d0b0f] transition-all font-bold text-[#3e2714]"
                    >
                        <option value="">Tất cả hành động</option>
                        {actions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>

                <select
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-2 text-sm outline-none focus:border-[#9d0b0f] transition-all font-bold text-[#3e2714]"
                >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                </select>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-[32px] border border-stone-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f7f4ef] text-[#3e2714] border-b border-stone-100">
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider">Người dùng</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider">Hành động</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider">Chi tiết</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider">IP / Thiết bị</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-wider text-right">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {loading && logs.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4 h-16 bg-gray-50/50"></td>
                                    </tr>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-stone-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#f7f4ef] flex items-center justify-center text-[#9d0b0f] font-bold">
                                                    {log.userId?.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#3e2714] text-sm">{log.userId?.name || "N/A"}</p>
                                                    <p className="text-[10px] text-[#88694f]">{log.userId?.email || "No email"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${log.action.includes("Xóa") ? "bg-red-50 text-red-600" :
                                                    log.action.includes("Tạo") ? "bg-green-50 text-green-600" :
                                                        "bg-blue-50 text-blue-600"
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-[#3e2714] line-clamp-2 max-w-xs">{log.details || "—"}</p>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] text-[#88694f]">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1">
                                                    <Globe size={10} /> {log.ipAddress || "Unknown"}
                                                </div>
                                                <div className="flex items-center gap-1 line-clamp-1 max-w-[200px]" title={log.userAgent}>
                                                    <Monitor size={10} /> {log.userAgent || "Unknown"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-xs font-bold text-[#3e2714]">{formatDate(log.createdAt)}</p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <Activity size={48} className="text-[#9d0b0f]" />
                                            <p className="font-bold text-[#3e2714]">Không tìm thấy nhật ký phù hợp.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="p-6 bg-[#f7f4ef] border-t border-stone-100 flex items-center justify-between">
                        <p className="text-sm text-[#88694f]">
                            Trang <span className="font-bold text-[#9d0b0f]">{pagination.page}</span> / {pagination.totalPages}
                            {" — "}Tổng <span className="font-bold">{pagination.total}</span> bản ghi
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || loading}
                                className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-[#9d0b0f] hover:text-white transition-all disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={currentPage === pagination.totalPages || loading}
                                className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-[#9d0b0f] hover:text-white transition-all disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
