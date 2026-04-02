import React, { useState, useEffect } from "react";
import { X, RefreshCw, Clock, History, ChevronLeft, ChevronRight, Activity } from "lucide-react";

const WarehouseHistoryModal = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1 });
    const LIMIT = 10;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", LIMIT);
            // Search for product and warehouse related keywords
            params.append("q", "sản phẩm"); 
            
            const res = await fetch(`${API_URL}/api/auth/admin-activities?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Filter for relevant warehouse actions specifically
                const warehouseActions = [
                    "Tạo sản phẩm", "Cập nhật sản phẩm", "Xóa sản phẩm", 
                    "Nhập Excel sản phẩm", "Nhập kho hàng loạt", "Nhập kho qua Excel"
                ];
                
                // If the backend search 'q' is broad, we filter here to be sure
                const filteredActivities = data.activities.filter(log => 
                    warehouseActions.includes(log.action) || 
                    log.action.toLowerCase().includes("nhập kho")
                );
                
                setLogs(filteredActivities);
                setPagination(data.pagination);
            }
        } catch (e) {
            console.error("Error fetching warehouse logs:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLogs(currentPage);
        }
    }, [isOpen, currentPage]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[32px] shadow-2xl flex flex-col border border-stone-200">
                {/* Header */}
                <div className="bg-[#800a0d] p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <History size={24} />
                        <div>
                            <h3 className="text-xl font-bold uppercase tracking-tight">Lịch sử hoạt động kho</h3>
                            <p className="text-[10px] text-white/70 uppercase font-bold tracking-widest">Hoạt động nhập/xuất & chỉnh sửa sản phẩm</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => fetchLogs(currentPage)} className="hover:rotate-180 transition-transform duration-500">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#fdfaf5]/30">
                    {loading && logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-[#800a0d]/20 border-t-[#800a0d] rounded-full animate-spin"></div>
                            <p className="text-[#88694f] font-bold italic">Đang tải dữ liệu lịch sử...</p>
                        </div>
                    ) : logs.length > 0 ? (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log._id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        log.action.includes("Tạo") ? "bg-green-100 text-green-600" :
                                        log.action.includes("Xóa") ? "bg-red-100 text-red-600" :
                                        log.action.includes("Nhập") ? "bg-blue-100 text-blue-600" :
                                        "bg-amber-100 text-amber-600"
                                    }`}>
                                        <Activity size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-[#800a0d] bg-[#800a0d]/5 px-2 py-0.5 rounded">
                                                {log.action}
                                            </span>
                                            <span className="text-[10px] text-[#88694f] font-bold flex items-center gap-1">
                                                <Clock size={12} /> {formatDate(log.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-[#3e2714] line-clamp-2">{log.details}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-5 h-5 rounded bg-[#fdfaf5] flex items-center justify-center text-[10px] font-bold text-[#800a0d]">
                                                {log.userId?.fullName?.charAt(0) || "A"}
                                            </div>
                                            <span className="text-[11px] text-[#88694f] font-medium">{log.userId?.fullName || "Quản trị viên"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ): (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <History size={48} className="text-stone-200 mb-4" />
                            <p className="text-[#88694f] font-bold">Chưa có dữ liệu lịch sử kho phù hợp.</p>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">Gợi ý: Thực hiện nhập kho hoặc chỉnh sửa sản phẩm để xem dữ liệu</p>
                        </div>
                    )}
                </div>

                {/* Footer / Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="p-4 bg-white border-t border-stone-100 flex items-center justify-center gap-4">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loading}
                            className="p-2 rounded-xl hover:bg-[#800a0d] hover:text-white transition-all disabled:opacity-30 border border-stone-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-black text-[#3e2714]">
                            Trang {currentPage} / {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={currentPage === pagination.totalPages || loading}
                            className="p-2 rounded-xl hover:bg-[#800a0d] hover:text-white transition-all disabled:opacity-30 border border-stone-100"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WarehouseHistoryModal;
