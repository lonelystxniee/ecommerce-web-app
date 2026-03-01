import React, { useState, useEffect } from "react";
import {
    MessageSquare,
    Trash2,
    Search,
    Star,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Loader2
} from "lucide-react";


const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalReviews: 0
    });

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5175/api/reviews?page=${page}&limit=10&search=${searchTerm}`);
            const data = await response.json();
            if (data.success) {
                setReviews(data.reviews);
                setPagination(data.pagination);
            } else {
                alert(data.message || "Không thể tải danh sách đánh giá");
            }
        } catch (error) {
            console.error("Fetch reviews error:", error);
            alert("Lỗi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [searchTerm]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không? Thao tác này không thể hoàn tác.")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5175/api/reviews/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await response.json();
            if (data.success) {
                alert("Đã xóa đánh giá thành công");
                fetchReviews(pagination.currentPage);
            } else {
                alert(data.message || "Không thể xóa đánh giá");
            }
        } catch (error) {
            console.error("Delete review error:", error);
            alert("Lỗi khi xóa đánh giá");
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-primary uppercase tracking-tighter">
                        <MessageSquare className="text-primary" />
                        Quản lý đánh giá
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Xem và quản lý tất cả phản hồi từ khách hàng</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm đánh giá..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading && reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                        <Loader2 className="animate-spin text-primary mb-4" size={40} />
                        <p className="text-gray-500 font-medium">Đang tải danh sách đánh giá...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-60">
                        <AlertCircle size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Không tìm thấy đánh giá nào</p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-4 text-primary font-bold text-sm hover:underline"
                            >
                                Xóa bộ lọc tìm kiếm
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Khách hàng</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Sản phẩm</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Đánh giá</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Nội dung</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {review.userID?.avatar ? (
                                                        <img src={review.userID.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                                            {review.userID?.fullName?.charAt(0) || "U"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-[#3e2714]">{review.userID?.fullName || "Người dùng ẩn danh"}</p>
                                                    <p className="text-xs text-gray-500">{review.userID?.email || "Chưa có email"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 max-w-xs">
                                                <img
                                                    src={review.productID?.images?.[0] || "https://via.placeholder.com/50"}
                                                    alt=""
                                                    className="w-10 h-10 object-contain rounded border border-gray-100 bg-white flex-shrink-0"
                                                />
                                                <p className="text-sm font-medium text-[#3e2714] line-clamp-1">{review.productID?.productName || "Sản phẩm không tồn tại"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {renderStars(review.rating)}
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600 line-clamp-2 italic">"{review.comment}"</p>
                                                {(review.images?.length > 0 || review.videos?.length > 0) && (
                                                    <div className="flex gap-1">
                                                        {review.images?.slice(0, 3).map((img, i) => (
                                                            <img key={i} src={img} className="w-8 h-8 rounded object-cover border border-gray-100" />
                                                        ))}
                                                        {review.videos?.length > 0 && (
                                                            <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center">
                                                                <ExternalLink size={12} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Xóa đánh giá"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <p className="text-sm text-gray-500 font-medium">
                            Hiển thị <span className="text-[#3e2714] font-bold">{(pagination.currentPage - 1) * 10 + 1}</span> - <span className="text-[#3e2714] font-bold">{Math.min(pagination.currentPage * 10, pagination.totalReviews)}</span> trong tổng số <span className="text-[#3e2714] font-bold">{pagination.totalReviews}</span> đánh giá
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchReviews(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="p-2 rounded border border-gray-200 bg-white text-gray-500 hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => fetchReviews(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="p-2 rounded border border-gray-200 bg-white text-gray-500 hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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

export default ReviewManagement;
