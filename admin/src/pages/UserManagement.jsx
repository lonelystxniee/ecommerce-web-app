import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  X,
} from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State cho Modal thêm người dùng
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
    status: "ACTIVE",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5175/api/auth/users");
      const data = await response.json();
      if (data.success) setUsers(data.users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý gửi Form thêm người dùng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5175/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Thêm thành công!");
        setIsModalOpen(false);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          role: "CUSTOMER",
          status: "ACTIVE",
        });
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối server!");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#9d0b0f] pb-4">
        <div>
          <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            Quản lý người dùng
          </h2>
          <p className="text-[#88694f] font-medium italic">
            Hệ thống thành viên Hồng Lam
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="p-3 bg-white border border-[#9d0b0f]/20 rounded-2xl text-[#9d0b0f]"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#9d0b0f] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-[#f39200] transition-all shadow-lg"
          >
            <Plus size={20} /> Thêm người dùng
          </button>
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-[#9d0b0f]/10">
        <div className="relative max-w-2xl">
          <Search
            className="absolute left-4 top-3.5 text-[#9d0b0f]"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm nhanh người dùng..."
            className="w-full pl-12 pr-4 py-3.5 bg-[#f7f4ef] rounded-2xl outline-none focus:border-[#f39200] border-2 border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng Dữ Liệu (Giữ nguyên phần table của bạn nhưng đổi map sang filteredUsers) */}
      <div className="bg-white/90 rounded-[32px] shadow-xl overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-[#9d0b0f] text-white text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-8 py-5">Người dùng</th>
              <th className="px-8 py-5">Liên hệ</th>
              <th className="px-8 py-5 text-center">Vai trò</th>
              <th className="px-8 py-5 text-center">Trạng thái</th>
              <th className="px-8 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-[#f7f4ef]/50 transition-colors"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f39200] text-white flex items-center justify-center font-bold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-[#3e2714]">
                      {user.fullName}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-[#88694f]">
                  {user.email}
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="px-3 py-1 bg-orange-50 text-[#f39200] text-[10px] font-bold rounded-full">
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full">
                    {user.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM NGƯỜI DÙNG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-[#f7f4ef] w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-zoomIn border-2 border-[#9d0b0f]">
            <div className="bg-[#9d0b0f] p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold uppercase tracking-tight">
                Thêm thành viên mới
              </h3>
              <X
                className="cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#88694f] uppercase mb-1">
                  Họ và tên
                </label>
                <input
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#f39200]"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#88694f] uppercase mb-1">
                  Email
                </label>
                <input
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#f39200]"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#88694f] uppercase mb-1">
                    Số điện thoại
                  </label>
                  <input
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#f39200]"
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#88694f] uppercase mb-1">
                    Mật khẩu
                  </label>
                  <input
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#f39200]"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#88694f] uppercase mb-1">
                    Vai trò
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="CUSTOMER">Khách hàng</option>
                    <option value="STAFF">Nhân viên</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#88694f] uppercase mb-1">
                    Trạng thái
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="LOCKED">Tạm khóa</option>
                  </select>
                </div>
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="w-full bg-[#9d0b0f] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#f39200] transition-all shadow-lg mt-4 disabled:bg-gray-400"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận thêm"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
