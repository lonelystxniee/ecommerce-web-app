import React, { useState, useEffect } from "react";
import {
  Newspaper,
  Play,
  Plus,
  Search,
  Trash2,
  Edit3,
  X,
  Calendar,
  MonitorPlay,
} from "lucide-react";

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const NewsAndVideoManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";
  const [activeTab, setActiveTab] = useState("news"); // news | video
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const [newsList, setNewsList] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    image: "",
    link: "",
    type: "news",
    date: new Date().toISOString().split("T")[0],
    status: "Hiện",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/articles`);
      const data = await res.json();
      if (data.success) {
        setNewsList(data.articles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || "",
        summary: item.summary || "",
        content: item.content || "",
        image: item.image || item.thumbnail || "",
        link: item.link || "",
        type: item.type || activeTab,
        date: item.date ? new Date(item.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        status: item.status || "Hiện"
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        summary: "",
        content: "",
        image: "",
        link: "",
        type: activeTab,
        date: new Date().toISOString().split("T")[0],
        status: "Hiện"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let payload = { ...formData };
    if (payload.type === "video" && payload.link && !payload.image) {
      const match = payload.link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        payload.image = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }

    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem 
      ? `${API_URL}/api/articles/${editingItem._id}` 
      : `${API_URL}/api/articles`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert("Lưu thành công!");
        setIsModalOpen(false);
        fetchArticles();
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Đã xảy ra lỗi khi lưu.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa mục này?")) {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/api/articles/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          fetchArticles();
        } else {
          alert("Lỗi xoá: " + data.message);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter based on search term
  const filteredNews = newsList.filter(n => (!n.type || n.type === 'news') && n.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredVideos = newsList.filter(v => v.type === 'video' && v.title.toLowerCase().includes(searchTerm.toLowerCase()));

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
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "news" ? "bg-[#9d0b0f] text-white shadow-md" : "text-gray-400 hover:text-[#9d0b0f]"
          }`}
        >
          <Newspaper size={16} /> TẠP CHÍ
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "video" ? "bg-[#9d0b0f] text-white shadow-md" : "text-gray-400 hover:text-[#9d0b0f]"
          }`}
        >
          <MonitorPlay size={16} /> THƯ VIỆN VIDEO
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : filteredNews.length > 0 ? (
            filteredNews.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-[32px] border border-stone-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-all group"
              >
                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 border border-stone-100 bg-gray-50 flex items-center justify-center text-gray-400">
                  {item.image ? (
                    <img
                      src={item.image}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={item.title}
                    />
                  ) : (
                    <span>No Image</span>
                  )}
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
                    {item.summary || "Chưa có tóm tắt..."}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(item.date).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Không tìm thấy bài viết nào.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video._id}
              className="bg-white rounded-[32px] border border-stone-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                {video.image ? (
                  <img
                    src={video.image}
                    className="w-full h-full object-cover"
                    alt={video.title}
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
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
                    <Calendar size={12} /> {new Date(video.date).toLocaleDateString("vi-VN")}
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

            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
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
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#88694f] uppercase tracking-widest ml-1">
                      Tóm tắt nội dung
                    </label>
                    <textarea
                      rows="2"
                      required
                      className="w-full p-4 rounded-2xl border border-stone-200 outline-none focus:border-[#f39200] text-sm bg-white"
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#88694f] uppercase tracking-widest ml-1">
                      Nội dung chi tiết
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      className="bg-white rounded-2xl overflow-hidden"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'image'],
                          ['clean']
                        ],
                      }}
                    />
                  </div>
                </>
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
                    value={formData.image || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        image: e.target.value,
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

              <button type="submit" className="w-full bg-[#9d0b0f] text-white py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-[#f39200] transition-all shadow-xl shadow-red-100 mt-4 cursor-pointer">
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
