import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  X,
  Upload,
  PlusCircle,
  Package,
  FileText,
} from "lucide-react";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Khởi tạo form
  const [formData, setFormData] = useState({
    name: "",
    slogan: "",
    category: "o-mai",
    description: "", // Trường mô tả đã có sẵn ở đây
    variants: [{ label: "200g", price: "", stock: 100 }],
    images: [],
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5175/api/products");
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0)
      return alert("Vui lòng thêm ít nhất 1 ảnh!");

    try {
      const res = await fetch("http://localhost:5175/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Thêm sản phẩm thành công!");
        setIsModalOpen(false);
        setFormData({
          name: "",
          slogan: "",
          category: "o-mai",
          description: "",
          variants: [{ label: "200g", price: "", stock: 100 }],
          images: [],
        });
        fetchProducts();
      }
    } catch (e) {
      alert("Lỗi khi thêm!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa sản phẩm này?")) {
      await fetch(`http://localhost:5175/api/products/${id}`, {
        method: "DELETE",
      });
      fetchProducts();
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#9d0b0f] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#f39200] transition-all shadow-lg"
        >
          <Plus size={20} /> Thêm sản phẩm mới
        </button>
      </div>

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
                  Chỉ từ {p.variants?.[0]?.price?.toLocaleString() || 0}đ
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[10px] bg-red-50 text-[#9d0b0f] px-2 py-1 rounded-lg font-bold uppercase">
                    {p.category}
                  </span>
                  <div className="flex gap-1">
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

      {/* MODAL THÊM SẢN PHẨM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-[#f7f4ef] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border-2 border-[#9d0b0f]">
            <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-bold uppercase">Thêm sản phẩm mới</h3>
              <X
                className="cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-[#88694f] uppercase block mb-1">
                    Tên sản phẩm
                  </label>
                  <input
                    required
                    className="w-full p-3 rounded-xl border outline-none focus:border-[#f39200]"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-[#88694f] uppercase block mb-1">
                    Slogan (Hương vị)
                  </label>
                  <input
                    className="w-full p-3 rounded-xl border outline-none focus:border-[#f39200]"
                    type="text"
                    placeholder="VD: Chua, cay, ngọt, dẻo"
                    value={formData.slogan}
                    onChange={(e) =>
                      setFormData({ ...formData, slogan: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-[#88694f] uppercase block mb-1">
                    Danh mục
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border outline-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="o-mai">Ô mai</option>
                    <option value="mut-tet">Mứt Tết</option>
                    <option value="banh-keo">Bánh kẹo</option>
                    <option value="thuc-uong">Thức uống</option>
                  </select>
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
