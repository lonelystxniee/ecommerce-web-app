import React, { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Search,
    Package,
    Save,
    PlusCircle,
    History,
    X,
    CheckCircle2,
    AlertCircle,
    Upload
} from "lucide-react";
import toast from "react-hot-toast";

const WarehouseManagement = () => {
    const [items, setItems] = useState([]);
    const [supplier, setSupplier] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        limit: 12
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        slogan: "",
        category: "",
        description: "",
        variants: [{ label: "Loại A", price: "", stock: 0 }],
        images: [],
    });
    const [imageFiles, setImageFiles] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

    useEffect(() => {
        fetchCategories();
        fetchAllProducts(1);
    }, []);

    const fetchAllProducts = async (page = 1) => {
        try {
            const res = await fetch(`${API_URL}/api/products?page=${page}&limit=12`);
            const data = await res.json();
            if (data.success) {
                setAllProducts(data.products || []);
                setPagination({
                    currentPage: data.pagination.currentPage,
                    totalPages: data.pagination.totalPages,
                    totalProducts: data.pagination.totalProducts,
                    limit: data.pagination.limit
                });
            }
        } catch (err) {
            console.error("Fetch all products error:", err);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchAllProducts(newPage);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/api/category`);
            const data = await res.json();
            if (data.success) {
                // Adjust categories mapping to match ProductManagement
                const cats = data.categories || data.data || [];
                setCategories(cats);
                if (cats.length > 0 && !formData.category) {
                    setFormData(prev => ({ ...prev, category: cats[0].categoryName || cats[0].name }));
                }
            }
        } catch (err) {
            console.error("Fetch categories error:", err);
        }
    };

    // --- Product Creation Handlers ---
    const handleAddVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { label: "", price: "", stock: 0 }],
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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImageFiles((prev) => [...prev, ...files]);
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData((prev) => ({
                        ...prev,
                        images: [...prev.images, reader.result],
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

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setImageFiles([]);
        setFormData({
            name: "",
            code: "",
            slogan: "",
            category: categories[0]?.categoryName || categories[0]?.name || "",
            description: "",
            variants: [{ label: "Loại A", price: "", stock: 0 }],
            images: [],
        });
    };

    const createNewProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const data = new FormData();
            data.append("name", formData.name);
            data.append("productCode", formData.code);
            data.append("slogan", formData.slogan || "");
            data.append("categoryName", formData.category);
            data.append("description", formData.description || "");
            data.append("price", formData.variants[0]?.price || 0);
            data.append("quantity", formData.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0));
            data.append("variants", JSON.stringify(formData.variants));

            if (imageFiles.length > 0) {
                imageFiles.forEach(file => data.append("images", file));
            }

            const res = await fetch(`${API_URL}/api/products`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: data,
            });

            const result = await res.json();
            if (result.success) {
                toast.success("Tạo sản phẩm mới và thêm vào danh sách nhập");
                // Add to warehouse items list
                const createdProduct = result.product;
                addNewItem(createdProduct);
                handleCloseModal();
            } else {
                toast.error(result.message || "Lỗi khi tạo sản phẩm");
            }
        } catch (err) {
            toast.error("Lỗi kết nối máy chủ");
        } finally {
            setLoading(false);
        }
    };
    // ---------------------------------

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`${API_URL}/api/products/search?q=${query}`);
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.products.slice(0, 10));
            }
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const addNewItem = (selectedProduct = null) => {
        const newItem = selectedProduct ? {
            productCode: selectedProduct.productCode,
            productName: selectedProduct.productName,
            product: selectedProduct._id,
            quantity: 1,
            price: selectedProduct.price || 0,
            categoryID: selectedProduct.categoryID?.[0]?._id || selectedProduct.categoryID?.[0] || "",
            variantLabel: selectedProduct.variants?.[0]?.label || "", // Default to first variant if exists
            variants: selectedProduct.variants || [],
            isNewProduct: false,
            isExisting: true
        } : {
            productCode: "",
            productName: "",
            quantity: 1,
            price: 0,
            categoryID: "",
            variantLabel: "",
            variants: [],
            isNewProduct: true,
            isExisting: false
        };
        setItems([...items, newItem]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const fetchHistory = () => {
        // History is no longer stored in a collection
        toast.info("Lịch sử nhập kho không được lưu trữ cục bộ để giữ hiệu năng hệ thống");
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            toast.error("Vui lòng thêm sản phẩm để nhập kho");
            return;
        }

        // Validation
        const invalidItem = items.find(i => !i.productCode || i.quantity <= 0);
        if (invalidItem) {
            toast.error("Vui lòng nhập đầy đủ Mã sản phẩm và Số lượng hợp lệ");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/products/bulk-stock-in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ items })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setItems([]);
                setSupplier("");
                setNote("");
            } else {
                toast.error(data.message || "Lỗi nhập kho");
            }
        } catch (err) {
            toast.error("Lỗi kết nối máy chủ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#800a0d] uppercase tracking-tighter flex items-center gap-3">
                        <Package size={32} />
                        Quản lý nhập kho
                    </h1>
                    <p className="text-[#88694f] text-sm font-medium italic mt-1">
                        Nhập hàng mới hoặc bổ sung tồn kho cho sản phẩm hiện có
                    </p>
                </div>
                <button
                    onClick={() => {
                        fetchHistory();
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg bg-white text-[#800a0d] border border-[#800a0d]/20`}
                >
                    <History size={18} />
                    Xem lịch sử tạm thời
                </button>
            </div>

            {/* Stock In Form */}
            <div className="space-y-6">
                {/* General Info */}
                <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-[#88694f] uppercase ml-1">Nhà cung cấp</label>
                        <input
                            type="text"
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                            placeholder="Ví dụ"
                            className="w-full px-5 py-3 bg-[#fdfaf5] border border-gray-100 rounded-2xl font-bold outline-none focus:border-[#800a0d] transition-all"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[11px] font-black text-[#88694f] uppercase ml-1">Ghi chú</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nội dung đợt nhập hàng này..."
                            className="w-full px-5 py-3 bg-[#fdfaf5] border border-gray-100 rounded-2xl font-bold outline-none focus:border-[#800a0d] transition-all"
                        />
                    </div>
                </div>

                {/* Product Selection */}
                <div className="relative">
                    <div className="bg-white p-4 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm sản phẩm hiện có theo mã hoặc tên..."
                                className="w-full pl-12 pr-4 py-3 bg-[#fdfaf5] border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#3e2714] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:rounded-sm transition-all shadow-lg flex items-center gap-2"
                        >
                            <Plus size={18} /> Nhập SP mới
                        </button>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchQuery.length > 0 && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 z-20 max-h-60 overflow-y-auto p-2">
                            {searchResults.map((product) => (
                                <button
                                    key={product._id}
                                    onClick={() => addNewItem(product)}
                                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#fdfaf5] transition-colors rounded-2xl text-left border-b border-gray-50 last:border-0"
                                >
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={product.images?.[0] || product.image || "/placeholder.png"} className="w-full h-full object-contain" alt="" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-[#3e2714] text-sm">{product.productName}</p>
                                        <p className="text-[10px] text-[#88694f] font-bold uppercase">{product.productCode}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-[#800a0d]">{product.price?.toLocaleString()}đ</p>
                                        <p className="text-[10px] text-gray-400 font-bold">Kho: {product.quantity}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Loading State for Search */}
                    {isSearching && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-3xl shadow-xl border border-gray-100 z-20 p-8 flex justify-center">
                            <div className="w-6 h-6 border-2 border-stone-200 border-t-[#800a0d] rounded-full animate-spin"></div>
                        </div>
                    )}

                    {/* Quick Selection Grid & Pagination */}
                    {searchQuery.length === 0 && allProducts.length > 0 && (
                        <div className="mt-8">
                            <h4 className="text-[10px] font-black text-[#88694f] uppercase tracking-widest mb-4 ml-1">Chọn nhanh sản phẩm</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {allProducts.map((product) => (
                                    <button
                                        key={product._id}
                                        onClick={() => addNewItem(product)}
                                        className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#800a0d]/30 transition-all text-left flex flex-col items-center group"
                                    >
                                        <div className="w-full aspect-square bg-[#fdfaf5] rounded-2xl mb-3 overflow-hidden">
                                            <img
                                                src={product.images?.[0] || product.image || "/placeholder.png"}
                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                                alt=""
                                            />
                                        </div>
                                        <p className="font-bold text-[#3e2714] text-[10px] line-clamp-2 text-center h-8">{product.productName}</p>
                                        <p className="text-[8px] text-[#800a0d] font-black mt-1 uppercase">{product.productCode}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-8 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black uppercase text-[#88694f] disabled:opacity-30 hover:bg-[#800a0d] hover:text-white transition-all shadow-sm"
                                    >
                                        Trước
                                    </button>
                                    <div className="flex gap-1">
                                        {[...Array(pagination.totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => handlePageChange(i + 1)}
                                                className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${pagination.currentPage === i + 1
                                                    ? "bg-[#800a0d] text-white shadow-lg"
                                                    : "bg-white border border-gray-100 text-[#3e2714] hover:bg-gray-50"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black uppercase text-[#88694f] disabled:opacity-30 hover:bg-[#800a0d] hover:text-white transition-all shadow-sm"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Entry List */}
                <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-[#fdfaf5]/30">
                        <h3 className="font-black text-[#800a0d] uppercase tracking-wider flex items-center gap-2">
                            Danh sách nhập hàng
                            {items.length > 0 && <span className="text-[10px] bg-[#800a0d] text-white px-2 py-0.5 rounded-full">{items.length}</span>}
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#fdfaf5] text-[10px] font-black uppercase text-[#88694f] tracking-widest border-b">
                                <tr>
                                    <th className="px-6 py-4 w-[180px]">Mã sản phẩm</th>
                                    <th className="px-6 py-4 min-w-[200px]">Tên & Danh mục</th>
                                    <th className="px-6 py-4 w-[120px]">Số lượng</th>
                                    <th className="px-6 py-4 w-[150px]">Giá bán lẻ</th>
                                    <th className="px-6 py-4 w-[180px]">Biến thể</th>
                                    <th className="px-6 py-4 text-center">Xóa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {items.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={item.productCode}
                                                readOnly={item.isExisting}
                                                onChange={(e) => updateItem(index, "productCode", e.target.value)}
                                                className={`w-full bg-[#fdfaf5] border border-gray-100 rounded-xl px-3 py-2 text-xs font-black uppercase outline-none focus:border-[#800a0d] ${item.isExisting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                placeholder="MÃ SP"
                                            />
                                        </td>
                                        <td className="px-6 py-4 space-y-2">
                                            <input
                                                type="text"
                                                value={item.productName}
                                                readOnly={item.isExisting}
                                                onChange={(e) => updateItem(index, "productName", e.target.value)}
                                                className={`w-full bg-[#fdfaf5] border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#800a0d] ${item.isExisting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                placeholder="Tên sản phẩm..."
                                            />
                                            {!item.isExisting && (
                                                <select
                                                    value={item.categoryID}
                                                    onChange={(e) => updateItem(index, "categoryID", e.target.value)}
                                                    className="w-full bg-[#fdfaf5] border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#800a0d]"
                                                >
                                                    <option value="">Chọn danh mục...</option>
                                                    {categories.map(cat => (
                                                        <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                                                    ))}
                                                </select>
                                            )}
                                            {item.isExisting && (
                                                <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold uppercase">
                                                    <CheckCircle2 size={12} /> Sản phẩm hiện có
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                min="1"
                                                onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                                                className="w-full bg-[#fdfaf5] border border-gray-100 rounded-xl px-3 py-2 text-xs font-black outline-none focus:border-[#800a0d]"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => updateItem(index, "price", parseInt(e.target.value) || 0)}
                                                className="w-full bg-[#fdfaf5] border border-gray-100 rounded-xl px-3 py-2 text-xs font-black text-[#f39200] outline-none focus:border-[#800a0d]"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.variants && item.variants.length > 0 ? (
                                                <select
                                                    value={item.variantLabel}
                                                    onChange={(e) => {
                                                        const label = e.target.value;
                                                        const variant = item.variants.find(v => v.label === label);
                                                        const newItems = [...items];
                                                        newItems[index].variantLabel = label;
                                                        if (variant) {
                                                            newItems[index].price = variant.price;
                                                        }
                                                        setItems(newItems);
                                                    }}
                                                    className="w-full bg-[#fdfaf5] border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#800a0d]"
                                                >
                                                    <option value="">Chọn loại...</option>
                                                    {item.variants.map((v, idx) => (
                                                        <option key={idx} value={v.label}>{v.label} ({v.price?.toLocaleString()}đ)</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={item.variantLabel}
                                                    onChange={(e) => updateItem(index, "variantLabel", e.target.value)}
                                                    className="w-full bg-[#fdfaf5] border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#800a0d]"
                                                    placeholder="VD: 500g"
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-24 text-center">
                                            <div className="max-w-xs mx-auto space-y-4">
                                                <div className="w-16 h-16 bg-[#fdfaf5] rounded-full flex items-center justify-center mx-auto text-[#88694f]/20">
                                                    <Package size={32} />
                                                </div>
                                                <p className="text-gray-400 font-bold italic">Chưa có sản phẩm nào trong danh sách nhập.</p>
                                                <p className="text-[10px] text-gray-300">Tìm sản phẩm phía trên hoặc nhấn "Nhập SP mới" để bắt đầu.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Batch Submission */}
                    {items.length > 0 && (
                        <div className="p-8 bg-[#fdfaf5]/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-left font-black">
                                <p className="text-[11px] text-[#88694f] uppercase tracking-widest">Tổng doanh thu dự kiến</p>
                                <p className="text-4xl text-[#800a0d]">{items.reduce((sum, i) => sum + (i.quantity * i.price), 0).toLocaleString()}đ</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setItems([])}
                                    className="px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all border border-gray-100 bg-white"
                                >
                                    Hủy bỏ tất cả
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-[#800a0d] text-white px-12 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:rounded-sm hover:bg-black transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    Hoàn tất nhập kho
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL THÊM SẢN PHẨM MỚI */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    ></div>
                    <div className="relative bg-[#f7f4ef] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border-2 border-[#800a0d]">
                        <div className="bg-[#800a0d] p-6 text-white flex justify-between items-center sticky top-0 z-10">
                            <h3 className="text-xl font-bold uppercase">
                                Thêm sản phẩm mới vào hệ thống
                            </h3>
                            <X className="cursor-pointer" onClick={handleCloseModal} />
                        </div>

                        <form onSubmit={createNewProduct} className="p-8 space-y-8">
                            {/* Thông tin cơ bản */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-[#88694f] mb-1.5 ml-1">
                                            Mã sản phẩm (SKU)
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-white border-2 border-stone-200 p-3.5 rounded-2xl outline-none focus:border-[#800a0d] transition-all font-bold text-[#3e2714]"
                                            placeholder="VD: OM001"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-[#88694f] mb-1.5 ml-1">
                                            Tên sản phẩm
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-white border-2 border-stone-200 p-3.5 rounded-2xl outline-none focus:border-[#800a0d] transition-all font-bold text-[#3e2714]"
                                            placeholder="VD: Ô mai sấu bao tử"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-[#88694f] mb-1.5 ml-1">
                                            Danh mục
                                        </label>
                                        <select
                                            className="w-full bg-white border-2 border-stone-200 p-3.5 rounded-2xl outline-none focus:border-[#800a0d] transition-all font-bold text-[#3e2714]"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            required
                                        >
                                            <option value="">Chọn danh mục...</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat.categoryName || cat.name}>
                                                    {cat.categoryName || cat.name}
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
                                            className="w-full bg-white border-2 border-stone-200 p-3.5 rounded-2xl outline-none focus:border-[#800a0d] transition-all font-bold text-[#3e2714]"
                                            placeholder="VD: Vị chua cay đặc trưng"
                                            value={formData.slogan}
                                            onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-[#88694f] uppercase block mb-1">
                                        Mô tả chi tiết sản phẩm
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Mô tả về hương vị, quy trình..."
                                        className="w-full p-3 rounded-2xl border-2 border-stone-200 outline-none focus:border-[#800a0d] bg-white text-sm"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Biến thể */}
                            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-[#800a0d] flex items-center gap-2 uppercase text-sm">
                                        <Package size={18} /> Các loại & Giá (Tùy chỉnh)
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
                                        <div key={index} className="flex gap-3 items-end bg-[#fdfaf5] p-4 rounded-2xl border border-dashed border-[#800a0d]/20">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Loại / Khối lượng</label>
                                                <input
                                                    required
                                                    className="w-full p-2.5 rounded-xl border text-sm"
                                                    type="text"
                                                    value={v.label}
                                                    onChange={(e) => handleVariantChange(index, "label", e.target.value)}
                                                    placeholder="VD: 500g"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Giá (VNĐ)</label>
                                                <input
                                                    required
                                                    className="w-full p-2.5 rounded-xl border text-sm"
                                                    type="number"
                                                    value={v.price}
                                                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                                />
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Tồn kho ban đầu</label>
                                                <input
                                                    required
                                                    className="w-full p-2.5 rounded-xl border text-sm"
                                                    type="number"
                                                    value={v.stock}
                                                    onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                                                />
                                            </div>
                                            {formData.variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariant(index)}
                                                    className="p-2.5 text-red-400 hover:text-red-600 mb-0.5"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ảnh */}
                            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-[#800a0d] flex items-center gap-2 uppercase text-sm mb-4">
                                    <Upload size={18} /> Hình ảnh sản phẩm
                                </h4>
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative aspect-square border-2 border-stone-100 rounded-2xl overflow-hidden group">
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-all">
                                        <Plus size={24} className="text-stone-300" />
                                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#800a0d] text-white py-4 rounded-2xl font-black uppercase hover:bg-black shadow-xl transition-all disabled:opacity-50"
                            >
                                {loading ? "Đang xử lý..." : "Lưu & Thêm vào danh sách nhập"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseManagement;
