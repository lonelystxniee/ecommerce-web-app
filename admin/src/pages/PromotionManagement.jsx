import React from "react";
import { Plus, Search, Edit3, Trash2, Calendar } from "lucide-react";

const PromotionManagement = () => {
  const promos = [
    {
      title: "Giảm giá cuối tuần",
      value: "20%",
      status: "Đang hoạt động",
      color: "from-orange-500 to-red-500",
      apply: "15 sản phẩm",
      date: "2026-01-25 - 2026-01-31",
    },
    {
      title: "Flash Sale 12h",
      value: "₫50.000",
      status: "Đang hoạt động",
      color: "from-orange-400 to-orange-600",
      apply: "8 sản phẩm",
      date: "2026-01-28 - 2026-01-28",
    },
    {
      title: "Mua 2 tặng 1",
      value: "Combo",
      status: "Đã kết thúc",
      color: "from-gray-400 to-gray-600",
      apply: "12 sản phẩm",
      date: "2026-01-20 - 2026-01-27",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý khuyến mãi</h2>
        <button className="bg-[#00b14f] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition-all">
          <Plus size={20} /> Tạo khuyến mãi
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm chương trình..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((promo, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
          >
            <div
              className={`bg-gradient-to-br ${promo.color} p-6 text-white relative`}
            >
              <span className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm">
                {promo.status}
              </span>
              <h3 className="text-3xl font-black mb-1">{promo.value}</h3>
              <p className="font-bold text-lg opacity-90">{promo.title}</p>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Sản phẩm áp dụng:</span>
                <span className="font-bold">{promo.apply}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-[10px]">
                <Calendar size={14} /> {promo.date}
              </div>
              <div className="flex gap-2 pt-4">
                <button className="flex-1 bg-green-50 text-[#00b14f] py-2.5 rounded-xl text-xs font-bold hover:bg-[#00b14f] hover:text-white transition-all flex items-center justify-center gap-2">
                  <Edit3 size={14} /> Sửa
                </button>
                <button className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionManagement;
