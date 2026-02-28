import React, { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    X,
    Edit2,
    Layers,
    FileText,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const LIMIT = 9;

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const fetchCategories = async () => {
        try {
            const res = await fetch("http://localhost:5175/api/category");
            const data = await res.json();
            if (data.success) {
                setCategories(data.categories || data.data || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode
                ? `http://localhost:5175/api/category/${editingCategoryId}`
                : "http://localhost:5175/api/category";
            const method = isEditMode ? "PUT" : "POST";
            const token = localStorage.getItem("token");
            const headers = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                alert(isEditMode ? "Cập nhật thành công!" : "Thêm danh mục thành công!");
                handleCloseModal();
                fetchCategories();
            } else {
                if (res.status === 401 || res.status === 403) {
                    alert("Bạn không có quyền thực hiện chức năng này. Vui lòng đăng nhập lại với quyền Admin!");
                } else {
                    alert(result.message || "Lỗi khi xử lý!");
                }
            }
        } catch (e) {
            alert("Lỗi kết nối server!");
        }
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description || "",
        });
        setEditingCategoryId(category._id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingCategoryId(null);
        setFormData({
            name: "",
            description: "",
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa danh mục này?")) {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5175/api/category/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                // If last item on page and page > 1, go back
                const remaining = categories.length - 1;
                const newTotalPages = Math.ceil(remaining / LIMIT);
                if (currentPage > newTotalPages && currentPage > 1) {
                    setCurrentPage(p => p - 1);
                }
                fetchCategories();
            } else {
                alert(data.message || "Lỗi khi xóa!");
            }
        }
    };

    const totalPages = Math.ceil(categories.length / LIMIT);
    const pagedCategories = categories.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-[#9d0b0f] pb-4">
                <div>
                    <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
                        Quản lý danh mục
                    </h2>
                    <p className="text-[#88694f] italic">
                        Quản lý các loại sản phẩm Ô mai Hồng Lam
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsEditMode(false);
                        setIsModalOpen(true);
                    }}
                    className="bg-[#9d0b0f] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#f39200] transition-all shadow-lg"
                >
                    <Plus size={20} /> Thêm danh mục mới
                </button>
            </div>

            {/* Danh sách danh mục */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pagedCategories.map((cat) => (
                    <div
                        key={cat._id}
                        className="bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-xl transition-all group p-6 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#f7f4ef] p-3 rounded-2xl text-[#9d0b0f]">
                                    <Layers size={24} />
                                </div>
                                <h3 className="font-bold text-xl text-[#3e2714]">
                                    {cat.name}
                                </h3>
                            </div>
                            <p className="text-[#88694f] text-sm line-clamp-3 mb-4">
                                {cat.description || "Chưa có mô tả."}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
                            <button
                                onClick={() => handleEdit(cat)}
                                className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(cat._id)}
                                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-[#88694f]">
                        Trang <span className="font-bold text-[#9d0b0f]">{currentPage}</span> / {totalPages}
                        {" — "}Tổng <span className="font-bold">{categories.length}</span> danh mục
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-gray-200 hover:bg-[#9d0b0f] hover:text-white hover:border-[#9d0b0f] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
                                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${currentPage === p
                                        ? "bg-[#9d0b0f] text-white shadow-lg"
                                        : "border border-gray-200 hover:border-[#9d0b0f] hover:text-[#9d0b0f]"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border border-gray-200 hover:bg-[#9d0b0f] hover:text-white hover:border-[#9d0b0f] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL THÊM/SỬA DANH MỤC */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    ></div>
                    <div className="relative bg-[#f7f4ef] w-full max-w-lg rounded-[32px] shadow-2xl border-2 border-[#9d0b0f] overflow-hidden">
                        <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold uppercase">
                                {isEditMode ? "Cập nhật danh mục" : "Thêm danh mục mới"}
                            </h3>
                            <X className="cursor-pointer" onClick={handleCloseModal} />
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-[#88694f] mb-1.5 ml-1">
                                    Tên danh mục
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-white border-2 border-stone-200 p-3.5 rounded-2xl outline-none focus:border-[#9d0b0f] transition-all font-bold text-[#3e2714]"
                                    placeholder="VD: Ô mai sấu"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-[#88694f] uppercase block mb-1 flex items-center gap-1">
                                    <FileText size={14} /> Mô tả danh mục
                                </label>
                                <textarea
                                    rows="4"
                                    placeholder="Mô tả ngắn gọn về danh mục này..."
                                    className="w-full p-3 rounded-xl border outline-none focus:border-[#9d0b0f] bg-white text-sm"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#9d0b0f] text-white py-4 rounded-xl font-bold uppercase hover:bg-[#f39200] shadow-lg transition-all"
                            >
                                {isEditMode ? "Cập nhật danh mục" : "Lưu danh mục"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
