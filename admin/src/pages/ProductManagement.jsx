import React from "react";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";

const ProductManagement = () => {
  const products = [
    {
      id: 1,
      name: "Rau cải xanh",
      category: "Rau củ",
      price: "15.000",
      stock: 50,
      status: "Còn hàng",
      image: "🥬",
    },
    {
      id: 2,
      name: "Táo Fuji",
      category: "Trái cây",
      price: "45.000",
      stock: 30,
      status: "Còn hàng",
      image: "🍎",
    },
    {
      id: 3,
      name: "Thịt ba chỉ",
      category: "Thịt cá",
      price: "120.000",
      stock: 0,
      status: "Hết hàng",
      image: "🥩",
    },
    {
      id: 4,
      name: "Cà rốt",
      category: "Rau củ",
      price: "10.000",
      stock: 45,
      status: "Còn hàng",
      image: "🥕",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h2>
          <p className="text-sm text-gray-500">
            Quản lý kho hàng và thông tin sản phẩm
          </p>
        </div>
        <button className="bg-[#00b14f] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-600 shadow-lg shadow-green-100 transition-all">
          <Plus size={20} /> Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
          >
            <div className="h-48 bg-green-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
              {p.image}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg ${p.status === "Còn hàng" ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}
                >
                  {p.status}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-4">{p.category}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[#00b14f] text-xl font-black">
                    ₫{p.price}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Tồn kho: {p.stock}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-colors">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 bg-green-50 text-[#00b14f] rounded-xl hover:bg-[#00b14f] hover:text-white transition-colors">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;
