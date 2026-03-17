import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Calendar,
  Tag,
  X,
  Edit3,
  Hash,
  Filter,
  ChevronLeft,
  ChevronRight,
  Ticket,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

const PromotionManagement = () => {
  const [promos, setPromos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATES CHO TÌM KIẾM, LỌC & PHÂN TRANG ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    code: "",
    discountType: "AMOUNT",
    discountValue: "",
    minOrderValue: 0,
    usageLimit: 100,
    endDate: "",
    description: "",
  });

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5175/api/promotions/all");
      const data = await res.json();
      if (data.success) setPromos(data.promos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredPromos = useMemo(() => {
    return promos.filter((p) => {
      const matchesSearch = p.code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "ALL" || p.discountType === typeFilter;

      let matchesStatus = true;
      const isExpired = new Date(p.endDate) < new Date();
      const isOut = p.usageLimit > 0 && p.usedCount >= p.usageLimit;

      if (statusFilter === "ACTIVE")
        matchesStatus = p.status === "ACTIVE" && !isExpired && !isOut;
      else if (statusFilter === "EXPIRED") matchesStatus = isExpired;
      else if (statusFilter === "OUT") matchesStatus = isOut;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [promos, searchTerm, typeFilter, statusFilter]);

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage) || 1;
  const currentItems = filteredPromos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const openModal = (promo = null) => {
    if (promo) {
      setEditingId(promo._id);
      setFormData({
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minOrderValue: promo.minOrderValue,
        usageLimit: promo.usageLimit,
        endDate: promo.endDate ? promo.endDate.split("T")[0] : "",
        description: promo.description || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        discountType: "AMOUNT",
        discountValue: "",
        minOrderValue: 0,
        usageLimit: 100,
        endDate: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId
      ? `http://localhost:5175/api/promotions/update/${editingId}`
      : "http://localhost:5175/api/promotions/create";

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert(editingId ? "Cập nhật thành công" : "Thêm mới thành công");
      setIsModalOpen(false);
      fetchPromos();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      const res = await fetch(
        `http://localhost:5175/api/promotions/delete/${id}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        alert("Đã xóa");
        fetchPromos();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#3e2714] pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-[#9d0b0f] pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            Quản lý khuyến mãi
          </h2>
          <p className="text-[#88694f] font-medium italic">
            Thiết lập ưu đãi và chiến dịch Voucher ClickGo
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#9d0b0f] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-black transition-all active:scale-95"
        >
          <Plus size={20} /> Tạo mã mới
        </button>
      </div>

      {/* THANH TÌM KIẾM & BỘ LỌC */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] shadow-sm border border-[#9d0b0f]/5 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder=""
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-[#f7f4ef] rounded-2xl outline-none focus:ring-2 focus:ring-[#f39200] transition-all font-bold text-sm"
          />
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-stone-200 px-4 py-3 rounded-2xl text-xs font-bold outline-none focus:border-[#9d0b0f] flex-1 lg:w-40"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang chạy</option>
            <option value="EXPIRED">Đã hết hạn</option>
            <option value="OUT">Hết lượt dùng</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-stone-200 px-4 py-3 rounded-2xl text-xs font-bold outline-none focus:border-[#9d0b0f] flex-1 lg:w-40"
          >
            <option value="ALL">Tất cả loại</option>
            <option value="AMOUNT">Giảm tiền (đ)</option>
            <option value="PERCENT">Giảm %</option>
          </select>
        </div>
      </div>

      {/* GRID HIỂN THỊ */}
      {loading ? (
        <div className="flex flex-col items-center py-20 text-gray-400 italic">
          <RefreshCcw className="animate-spin mb-2" /> Đang tải khuyến mãi...
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-stone-200">
          <Ticket size={48} className="mx-auto text-stone-200 mb-4" />
          <p className="text-stone-400 font-medium italic">
            Không tìm thấy mã giảm giá nào khớp với yêu cầu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((promo) => {
            const isExpired = new Date(promo.endDate) < new Date();
            const isOut =
              promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit;
            const isInactive = promo.status !== "ACTIVE" || isExpired || isOut;

            return (
              <div
                key={promo._id}
                className="relative bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden group hover:shadow-xl transition-all"
              >
                {/* Actions Overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => openModal(promo)}
                    className="p-2.5 bg-white/90 rounded-xl text-blue-600 shadow-md hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(promo._id)}
                    className="p-2.5 bg-white/90 rounded-xl text-red-600 shadow-md hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div
                  className={`bg-gradient-to-br ${isInactive ? "from-gray-400 to-gray-600" : "from-[#9d0b0f] to-[#f39200]"} p-6 text-white`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-3xl font-black tracking-tighter">
                      {promo.discountType === "AMOUNT"
                        ? `${promo.discountValue / 1000}K`
                        : `${promo.discountValue}%`}
                    </h3>
                    <span className="text-[9px] font-black bg-white/20 px-3 py-1 rounded-full uppercase backdrop-blur-md border border-white/10">
                      {isExpired
                        ? "Hết hạn"
                        : isOut
                          ? "Hết lượt"
                          : promo.status}
                    </span>
                  </div>
                  <p className="font-bold text-lg uppercase mt-2 tracking-widest">
                    {promo.code}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-wider">
                      <span>Lượt sử dụng</span>
                      <span
                        className={isOut ? "text-red-500" : "text-[#9d0b0f]"}
                      >
                        {promo.usedCount} / {promo.usageLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${isOut ? "bg-red-500" : "bg-[#f39200]"}`}
                        style={{
                          width: `${Math.min(100, (promo.usedCount / promo.usageLimit) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2 border-t border-stone-100">
                    <p className="text-[11px] text-[#88694f] font-bold italic leading-relaxed">
                      {promo.description ||
                        `Giảm ngay cho đơn từ ${promo.minOrderValue.toLocaleString()}đ`}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase">
                      <Calendar size={14} /> Hết hạn:{" "}
                      {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PHÂN TRANG */}
      {totalPages > 0 && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="p-3 rounded-2xl bg-white border border-stone-200 text-[#9d0b0f] disabled:opacity-30 hover:bg-red-50 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-black text-[#88694f]">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="p-3 rounded-2xl bg-white border border-stone-200 text-[#9d0b0f] disabled:opacity-30 hover:bg-red-50 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL FORM (Giữ nguyên cấu trúc xịn của bạn nhưng thêm mô tả) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#f7f4ef] w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl border-2 border-[#9d0b0f] animate-zoomIn">
            <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                <Tag size={20} />{" "}
                {editingId ? "Cập nhật khuyến mãi" : "Tạo chương trình mới"}
              </h3>
              <X
                className="cursor-pointer hover:rotate-90 transition-transform"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-[#88694f] uppercase mb-1 block">
                    Mã giảm giá (Code)
                  </label>
                  <input
                    required
                    placeholder=""
                    className="w-full p-3 rounded-2xl border border-stone-200 outline-none focus:border-[#f39200] font-black uppercase text-center text-lg tracking-widest"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-[#88694f] uppercase mb-1 block">
                    Mô tả ngắn gọn
                  </label>
                  <input
                    placeholder=""
                    className="w-full p-3 rounded-2xl border border-stone-200 outline-none focus:border-[#f39200] text-sm"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#88694f] uppercase mb-1 block">
                    Hình thức giảm
                  </label>
                  <select
                    className="w-full p-3 rounded-2xl border border-stone-200 outline-none font-bold text-xs"
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                  >
                    <option value="AMOUNT">Giảm tiền mặt (đ)</option>
                    <option value="PERCENT">Giảm phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#88694f] uppercase mb-1 block">
                    Giá trị giảm
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full p-3 rounded-2xl border border-stone-200 outline-none font-black"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#88694f] uppercase mb-1 block">
                    Đơn tối thiểu
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 rounded-2xl border border-stone-200 outline-none font-bold"
                    value={formData.minOrderValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderValue: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#88694f] uppercase mb-1 block">
                    Giới hạn lượt dùng
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 rounded-2xl border border-stone-200 outline-none font-bold"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-[#88694f] uppercase mb-1 block">
                    Ngày hết hạn
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full p-3 rounded-2xl border border-stone-200 outline-none font-bold"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <button className="w-full bg-[#9d0b0f] text-white py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-[#f39200] transition-all shadow-lg shadow-red-100 mt-4">
                {editingId ? "Lưu thay đổi" : "Phát hành mã"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;
