import React, { useState, useEffect, useMemo } from "react";
import {
  Newspaper,
  Play,
  Plus,
  Search,
  Trash2,
  Edit3,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Calendar,
  Eye,
  RefreshCcw,
  LayoutGrid,
  FileText,
  MonitorPlay,
} from "lucide-react";

const NewsAndVideoManagement = () => {
  const [activeTab, setActiveTab] = useState("news"); // news | video
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // --- DỮ LIỆU GIẢ LẬP (Sẽ thay bằng API sau) ---
  const [newsList, setNewsList] = useState([
    {
      _id: "1",
      title: "Nhìn lại sự kiện ra mắt bộ sưu tập quà Tết 2026",
      summary:
        "Sự kiện ra mắt bộ sưu tập quà Tết 2026 đã diễn ra trong không khí ấm cúng...",
      image: "https://cdn.honglam.vn/honglam/8_297d391f7a.png",
      date: "2024-12-14",
      status: "Hiện",
    },
    {
      _id: "2",
      title: "Hồng Lam chung tay hỗ trợ Trường Mầm non Kim Lư",
      summary:
        "Hoạt động thiện nguyện nhằm hỗ trợ thầy cô và học sinh sau đợt mưa lũ...",
      image: "https://cdn.honglam.vn/honglam/Thumb_4_0649d483dc.png",
      date: "2024-11-20",
      status: "Hiện",
    },
  ]);

  const [videoList, setVideoList] = useState([
    {
      _id: "v1",
      title: "Click Go gửi dáng quê nhà",
      link: "https://youtu.be/...",
      thumbnail:
        "https://cdn.honglam.vn/honglam/Hong_Lam_gui_dang_que_nha_video_thumnail_2b00974899.jpg",
      date: "2024-12-01",
    },
    {
      _id: "v2",
      title: "Ô mai Click Go - Bốn khúc tinh hoa",
      link: "https://youtu.be/...",
      thumbnail: "https://cdn.honglam.vn/honglam/hqdefault_e8477e15b1.jpg",
      date: "2024-10-15",
    },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    image: "",
    link: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        summary: "",
        image: "",
        link: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa mục này?")) {
      if (activeTab === "news")
        setNewsList(newsList.filter((n) => n._id !== id));
      else setVideoList(videoList.filter((v) => v._id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10 text-[#3e2714]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-[#9d0b0f] pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            Quản lý Nội dung
          </h2>
          <p className="text-[#88694f] font-medium italic text-sm">
            Cập nhật tin tức tạp chí và thư viện video
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#9d0b0f] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-black transition-all"
        >
          <Plus size={20} />{" "}
          {activeTab === "news" ? "Viết bài mới" : "Thêm Video"}
        </button>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-[#9d0b0f]/10 w-fit">
        <button
          onClick={() => setActiveTab("news")}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "news" ? "bg-[#9d0b0f] text-white shadow-md" : "text-gray-400 hover:text-[#9d0b0f]"}`}
        >
          <Newspaper size={16} /> TẠP CHÍ
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "video" ? "bg-[#9d0b0f] text-white shadow-md" : "text-gray-400 hover:text-[#9d0b0f]"}`}
        >
          <MonitorPlay size={16} /> THƯ VIỆN VIDEO
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder={`Tìm kiếm ${activeTab === "news" ? "bài viết" : "video"}...`}
          className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#f39200] font-bold text-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CONTENT LIST */}
      {activeTab === "news" ? (
        <div className="space-y-4">
          {newsList.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-[32px] border border-stone-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-all group"
            >
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 border border-stone-100">
                <img
                  src={item.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt=""
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-lg text-[#3e2714] line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 italic">
                  {item.summary}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {item.date}
                  </span>
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoList.map((video) => (
            <div
              key={video._id}
              className="bg-white rounded-[32px] border border-stone-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={video.thumbnail}
                  className="w-full h-full object-cover"
                  alt=""
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#f39200] rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Play fill="white" size={20} />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-black text-[#3e2714] line-clamp-2 mb-4 h-10 text-sm uppercase">
                  {video.title}
                </h3>
                <div className="flex justify-between items-center border-t pt-4">
                  <span className="text-[10px] font-black text-gray-400 flex items-center gap-1 uppercase">
                    <Calendar size={12} /> {video.date}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(video)}
                      className="text-blue-600 hover:scale-110 transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="text-red-600 hover:scale-110 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#f7f4ef] w-full max-w-2xl rounded-[40px] shadow-2xl border-2 border-[#9d0b0f] animate-zoomIn overflow-hidden">
            <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                {activeTab === "news" ? <Newspaper /> : <MonitorPlay />}
                {editingItem ? "Cập nhật" : "Thêm mới"}{" "}
                {activeTab === "news" ? "bài viết" : "video"}
              </h3>
              <X
                className="cursor-pointer hover:rotate-90 transition-transform"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <form className="p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#88694f] uppercase tracking-widest ml-1">
                  Tiêu đề {activeTab === "news" ? "bài viết" : "video"}
                </label>
                <input
                  required
                  className="w-full p-4 rounded-2xl border border-stone-200 outline-none focus:border-[#f39200] font-bold text-sm bg-white"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {activeTab === "news" ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#88694f] uppercase tracking-widest ml-1">
                    Tóm tắt nội dung
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-4 rounded-2xl border border-stone-200 outline-none focus:border-[#f39200] text-sm bg-white"
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#88694f] uppercase tracking-widest ml-1">
                    Link Video (YouTube)
                  </label>
                  <input
                    required
                    className="w-full p-4 rounded-2xl border border-stone-200 outline-none focus:border-[#f39200] text-sm bg-white"
                    placeholder="https://youtu.be/..."
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#88694f] uppercase tracking-widest ml-1">
                    Link {activeTab === "news" ? "ảnh bìa" : "thumbnail"}
                  </label>
                  <input
                    className="w-full p-4 rounded-2xl border border-stone-200 outline-none focus:border-[#f39200] text-sm bg-white font-medium"
                    value={formData.image || formData.thumbnail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [activeTab === "news" ? "image" : "thumbnail"]:
                          e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#88694f] uppercase tracking-widest ml-1">
                    Ngày hiển thị
                  </label>
                  <input
                    type="date"
                    className="w-full p-4 rounded-2xl border border-stone-200 outline-none focus:border-[#f39200] font-bold text-sm bg-white"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <button className="w-full bg-[#9d0b0f] text-white py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-[#f39200] transition-all shadow-xl shadow-red-100 mt-4">
                Lưu vào hệ thống
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsAndVideoManagement;
