import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  X,
  Upload,
  PlusCircle,
  Package,
  FileText,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalProducts: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const LIMIT = 12;

  // Khởi tạo form
  const [formData, setFormData] = useState({
    name: "",
    code: "", // Added code field
    slogan: "",
    category: "o-mai",
    description: "", // Trường mô tả đã có sẵn ở đây
    variants: [{ label: "200g", price: "", stock: 100 }],
    images: [],
  });

  const [imageFiles, setImageFiles] = useState([]);

  const [categories, setCategories] = useState([]);

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

  const fetchProducts = async (page = currentPage, search = searchTerm, categoryId = filterCategory, sortOrder = sort) => {
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:5175/api/products?page=${page}&limit=${LIMIT}`;

      const hasFilters = search.trim() || categoryId || sortOrder !== "newest";
      if (hasFilters) {
        const queryParams = new URLSearchParams({
          page,
          limit: LIMIT,
          ...(search.trim() && { q: search.trim() }),
          ...(categoryId && { categoryId }),
          ...(sortOrder && { sort: sortOrder }),
        });
        url = `http://localhost:5175/api/products/search?${queryParams.toString()}`;
      }

      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, searchTerm, filterCategory, sort);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts(currentPage, searchTerm, filterCategory, sort);
    fetchCategories();
  }, [currentPage, filterCategory, sort]);

  // --- XỬ LÝ BIẾN THỂ ---
  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { label: "", price: "", stock: 100 }],
    });
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: updatedVariants });
  };

  // --- XỬ LÝ ẢNH ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, reader.result], // Preview
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0 && !isEditMode)
      return alert("Vui lòng thêm ít nhất một ảnh sản phẩm!");

    try {
      const url = isEditMode
        ? `http://localhost:5175/api/products/${editingProductId}`
        : "http://localhost:5175/api/products";
      const method = isEditMode ? "PUT" : "POST";
      const token = localStorage.getItem("token");

      const data = new FormData();
      data.append("name", formData.name);
      data.append("productCode", formData.code); // Map code to productCode
      data.append("slogan", formData.slogan);
      data.append("categoryName", formData.category);
      data.append("description", formData.description);
      data.append("price", formData.variants[0]?.price || 0); // Backend expects single price/quantity for now
      data.append("quantity", formData.variants[0]?.stock || 0);

      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          data.append("images", file);
        });
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: data,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        alert(isEditMode ? "Cập nhật thành công!" : "Thêm sản phẩm thành công!");
        handleCloseModal();
        fetchProducts();
      } else {
        alert(result.message || "Lỗi khi xử lý!");
      }
    } catch (e) {
      alert("Lỗi kết nối server!");
    }
  };

  const handleImportExcel = async (e) => {
    if (isLoading) return;
    const file = e.target.files[0];
    if (!file) return;

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn nhập sản phẩm từ tệp ${file.name}?`
      )
    )
      return;

    try {
      setIsLoading(true);
      const data = new FormData();
      data.append("file", file);
      const token = localStorage.getItem("token");

      console.log("Đang tải tệp lên server...");
      const res = await fetch("http://localhost:5175/api/products/import-excel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();
      if (result.success) {
        const { insertedCount, failedCount, errors: importErrors, createdCategoriesCount } = result;
        let msg = `✅ Nhập thành công ${insertedCount} sản phẩm!`;
        if (createdCategoriesCount > 0) msg += `\n📁 Đã tự động tạo ${createdCategoriesCount} danh mục mới.`;
        if (failedCount > 0) {
          msg += `\n⚠️ ${failedCount} dòng bị lỗi:`;
          importErrors.slice(0, 5).forEach(e => {
            msg += `\n  - Dòng ${e.row}: ${e.message}`;
          });
          if (failedCount > 5) msg += `\n  ... và ${failedCount - 5} lỗi khác.`;
        }
        alert(msg);
        fetchProducts();
      } else {
        alert(result.message || "Lỗi khi nhập Excel! Kiểm tra định dạng file.");
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Lỗi kết nối server hoặc file quá lớn!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      code: product.productCode || "", // Map backend's productCode to code
      slogan: product.slogan || "",
      category: product.categoryID?.[0]?.name || "o-mai",
      description: product.description || "",
      variants: [{ label: "Giá gốc", price: product.price, stock: product.quantity }],
      images: product.images || (product.image ? [product.image] : []),
    });
    setImageFiles([]);
    setEditingProductId(product._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingProductId(null);
    setImageFiles([]);
    setFormData({
      name: "",
      code: "", // Reset code
      slogan: "",
      category: "o-mai",
      description: "",
      variants: [{ label: "200g", price: "", stock: 100 }],
      images: [],
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa sản phẩm này?")) {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5175/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      } else {
        alert(data.message || "Lỗi khi xóa!");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-[#9d0b0f] pb-4">
        <div>
          <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            Quản lý sản phẩm
          </h2>
          <p className="text-[#88694f] italic">
            Cập nhật kho hàng Ô mai Hồng Lam
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã..."
              className="pl-10 pr-4 py-2 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#9d0b0f] transition-all w-48 md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-2 text-sm outline-none focus:border-[#9d0b0f] transition-all font-bold text-[#3e2714] min-w-[140px]"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-2 text-sm outline-none focus:border-[#9d0b0f] transition-all font-bold text-[#3e2714] min-w-[140px]"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="oldest">Cũ nhất</option>
          </select>

          <label className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg cursor-pointer">
            <Upload size={20} /> Nhập Excel
            <input
              type="file"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
            />
          </label>
          <button
            onClick={() => {
              setIsEditMode(false);
              setIsModalOpen(true);
            }}
            className={`bg-[#9d0b0f] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#f39200] transition-all shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </div>
            ) : (
              <>
                <Plus size={20} /> Thêm sản phẩm mới
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-4 border-2 border-[#9d0b0f]">
            <div className="w-12 h-12 border-4 border-[#9d0b0f] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-[#9d0b0f] animate-pulse">Đang nhập dữ liệu từ Excel...</p>
            <p className="text-xs text-gray-400">Vui lòng không đóng trình duyệt</p>
          </div>
        </div>
      )}

      {/* Grid sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => {
          const displayImage =
            p.images && p.images.length > 0
              ? p.images[0]
              : p.image || "https://via.placeholder.com/150";

          return (
            <div
              key={p._id}
              className="bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="h-48 bg-[#f7f4ef] flex items-center justify-center overflow-hidden">
                <img
                  src={displayImage}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  alt={p.name}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-[#3e2714] line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-[#9d0b0f] text-lg font-black mt-2">
                  Chỉ từ {p.price?.toLocaleString() || 0}đ
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[10px] bg-red-50 text-[#9d0b0f] px-2 py-1 rounded-lg font-bold uppercase">
                    {p.category}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-[#88694f]">
            Trang <span className="font-bold text-[#9d0b0f]">{pagination.currentPage}</span> / {pagination.totalPages}
            {" — "}Tổng <span className="font-bold">{pagination.totalProducts}</span> sản phẩm
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 hover:bg-[#9d0b0f] hover:text-white hover:border-[#9d0b0f] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - currentPage) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                ) : (
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
                )
              )}

            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="p-2 rounded-xl border border-gray-200 hover:bg-[#9d0b0f] hover:text-white hover:border-[#9d0b0f] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL THÊM SẢN PHẨM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="relative bg-[#f7f4ef] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border-2 border-[#9d0b0f]">
            <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-bold uppercase">
                {isEditMode ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <X className="cursor-pointer" onClick={handleCloseModal} />
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#88694f] mb-1.5 ml-1">
                    Mã sản phẩm (SKU)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#f7f4ef] border-2 border-stone-200 p-3.5 rounded-2xl outline-none focus:border-[#9d0b0f] transition-all font-bold text-[#3e2714]"
                    placeholder="VD: OM001"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[#88694f] mb-1.5 ml-1">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#f7f4ef] border-2 border-stone-200 p-3.5 rounded-2xl outline-none focus:border-[#9d0b0f] transition-all font-bold text-[#3e2714]"
                    placeholder="VD: Ô mai sấu bao tử"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#88694f] mb-1.5 ml-1">
                      Danh mục
                    </label>
                    <select
                      className="w-full bg-[#f7f4ef] border-2 border-stone-200 p-3.5 rounded-2xl outline-none focus:border-[#9d0b0f] transition-all font-bold text-[#3e2714]"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#88694f] mb-1.5 ml-1">
                      Slogan / Mô tả ngắn
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#f7f4ef] border-2 border-stone-200 p-3.5 rounded-2xl outline-none focus:border-[#9d0b0f] transition-all font-bold text-[#3e2714]"
                      placeholder="VD: Vị chua cay đặc trưng"
                      value={formData.slogan}
                      onChange={(e) =>
                        setFormData({ ...formData, slogan: e.target.value })
                      }
                    />
                  </div>
                </div>
                {/* ===== PHẦN MÔ TẢ SẢN PHẨM MỚI THÊM ===== */}
                <div className="col-span-2">
                  <label className="text-xs font-bold text-[#88694f] uppercase block mb-1 flex items-center gap-1">
                    <FileText size={14} /> Mô tả chi tiết sản phẩm
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Nhập mô tả về hương vị, cảm giác khi ăn, quy trình chế biến đặc biệt..."
                    className="w-full p-3 rounded-xl border outline-none focus:border-[#f39200] bg-white text-sm"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* PHẦN BIẾN THỂ */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-[#9d0b0f] flex items-center gap-2 uppercase text-sm">
                    <Package size={18} /> Các loại khối lượng & Giá
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-[#f39200] flex items-center gap-1 text-xs font-black hover:underline"
                  >
                    <PlusCircle size={16} /> Thêm mức giá
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.variants.map((v, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-end bg-[#f7f4ef]/50 p-3 rounded-xl border border-dashed border-[#9d0b0f]/20"
                    >
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                          Khối lượng
                        </label>
                        <input
                          required
                          className="w-full p-2 rounded-lg border text-sm"
                          type="text"
                          value={v.label}
                          onChange={(e) =>
                            handleVariantChange(index, "label", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                          Giá (VNĐ)
                        </label>
                        <input
                          required
                          className="w-full p-2 rounded-lg border text-sm"
                          type="number"
                          value={v.price}
                          onChange={(e) =>
                            handleVariantChange(index, "price", e.target.value)
                          }
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                          Tồn kho
                        </label>
                        <input
                          required
                          className="w-full p-2 rounded-lg border text-sm"
                          type="number"
                          value={v.stock}
                          onChange={(e) =>
                            handleVariantChange(index, "stock", e.target.value)
                          }
                        />
                      </div>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="p-2 text-red-400 hover:text-red-600 mb-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* PHẦN TẢI ẢNH */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-[#9d0b0f] flex items-center gap-2 uppercase text-sm mb-4">
                  <Upload size={18} /> Hình ảnh sản phẩm (Nhiều ảnh)
                </h4>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {formData.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square border rounded-xl overflow-hidden group"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                    <Plus size={24} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                      Tải ảnh
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#9d0b0f] text-white py-4 rounded-xl font-bold uppercase hover:bg-[#f39200] shadow-lg transition-all"
              >
                Lưu sản phẩm vào hệ thống
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
