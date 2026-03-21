import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  X,
  Image as ImageIcon,
  RefreshCcw,
  ExternalLink,
  Monitor,
  Layout,
  Layers,
} from "lucide-react";

const AdvertisementManagement = () => {
  const [activeTab, setActiveTab] = useState("hero");
  const [ads, setAds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "hero",
    image: "",
    link: "",
    status: "ACTIVE",
    position: 1,
  });

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5175/api/ads");
      const data = await res.json();
      if (data.success) setAds(data.ads);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        type: activeTab,
        image: "",
        link: "",
        status: "ACTIVE",
        position: ads.filter((a) => a.type === activeTab).length + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingItem
      ? `http://localhost:5175/api/ads/${editingItem._id}`
      : "http://localhost:5175/api/ads";
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Thành công!");
        setIsModalOpen(false);
        fetchAds();
      }
    } catch (e) {
      alert("Lỗi kết nối!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa quảng cáo này?")) {
      await fetch(`http://localhost:5175/api/ads/${id}`, { method: "DELETE" });
      fetchAds();
    }
  };

  const filteredAds = ads.filter((ad) => ad.type === activeTab);

  return (
    <div className="space-y-6 animate-fadeIn pb-10 text-[#3e2714]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-[#9d0b0f] pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            Quản lý Quảng cáo
          </h2>
          <p className="text-[#88694f] font-medium italic text-sm">
            Cấu hình Banner Slide, Sidebar và Popup chào mừng
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#9d0b0f] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-black transition-all"
        >
          <Plus size={20} /> Thêm mới
        </button>
      </div>

      <div className="flex p-1 bg-white rounded-3xl shadow-sm border border-[#9d0b0f]/10 w-full lg:w-fit">
        <TabButton
          active={activeTab === "hero"}
          onClick={() => setActiveTab("hero")}
          icon={<Monitor size={16} />}
          label="SLIDE"
        />
        <TabButton
          active={activeTab === "sidebar"}
          onClick={() => setActiveTab("sidebar")}
          icon={<Layout size={16} />}
          label="SIDEBAR"
        />
        <TabButton
          active={activeTab === "popup"}
          onClick={() => setActiveTab("popup")}
          icon={<Layers size={16} />}
          label="POPUP"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredAds.map((ad) => (
          <div
            key={ad._id}
            className="bg-white rounded-[40px] shadow-sm border border-stone-100 overflow-hidden group hover:shadow-xl transition-all flex flex-col"
          >
            <div className="relative h-48 bg-[#f7f4ef] overflow-hidden">
              <img
                src={ad.image}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt=""
              />
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${ad.status === "ACTIVE" ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}
                >
                  {ad.status}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-black text-lg text-[#3e2714] line-clamp-1 uppercase tracking-tight">
                {ad.title}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold truncate mt-1">
                Link: {ad.link}
              </p>
              <div className="mt-6 flex justify-between items-center border-t pt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(ad)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(ad._id)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <span className="text-xs font-black text-[#88694f]">
                  Vị trí: {ad.position}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#f7f4ef] w-full max-w-2xl rounded-[44px] shadow-2xl border-2 border-[#9d0b0f] animate-zoomIn overflow-hidden">
            <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase">
                {editingItem ? "Sửa" : "Thêm"} Quảng cáo
              </h3>
              <X
                className="cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-[#88694f] uppercase block mb-1">
                    Tiêu đề
                  </label>
                  <input
                    required
                    className="w-full p-4 rounded-2xl border outline-none font-bold text-sm bg-white"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-[#88694f] uppercase block mb-1">
                    Link hình ảnh (URL)
                  </label>
                  <input
                    required
                    className="w-full p-4 rounded-2xl border outline-none text-sm bg-white"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#88694f] uppercase block mb-1">
                    Trạng thái
                  </label>
                  <select
                    className="w-full p-4 rounded-2xl border outline-none font-bold text-xs"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="ACTIVE">HIỂN THỊ</option>
                    <option value="INACTIVE">ẨN</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#88694f] uppercase block mb-1">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 rounded-2xl border outline-none font-bold text-sm"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                </div>
              </div>
              <button className="w-full bg-[#9d0b0f] text-white py-5 rounded-full font-black uppercase text-xs hover:bg-[#f39200] transition-all">
                LƯU
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-[24px] text-[10px] font-black uppercase transition-all ${active ? "bg-[#9d0b0f] text-white shadow-lg" : "text-gray-400 hover:text-[#9d0b0f]"}`}
  >
    {icon} {label}
  </button>
);

export default AdvertisementManagement;
