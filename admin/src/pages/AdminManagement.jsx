/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCcw,
  X,
  User as UserIcon,
  Shield,
  Phone,
  Mail,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
} from "lucide-react";

const AdminManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "ADMIN",
    status: "ACTIVE",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      // Lọc chỉ lấy ADMIN và STAFF
      if (data.success) {
        setUsers(
          data.users.filter((u) => u.role === "ADMIN"),
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "ADMIN",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditMode(true);
    setSelectedUserId(user._id);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      password: "",
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editMode
        ? `${API_URL}/api/auth/users/${selectedUserId}`
        : `${API_URL}/api/auth/users`;

      const method = editMode ? "PUT" : "POST";
      const token = localStorage.getItem("token");

      const payload = { ...formData };
      if (editMode && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert(
          editMode ? "Cập nhật thành công!" : "Tạo quản trị viên thành công!",
        );
        setIsModalOpen(false);
        fetchUsers();
      } else {
        alert(data.message || "Thao tác thất bại");
      }
    } catch (error) {
      alert("Lỗi kết nối server!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    const actionText = newStatus === "LOCKED" ? "khóa" : "mở khóa";

    if (
      window.confirm(
        `Bạn có chắc chắn muốn ${actionText} tài khoản quản trị này?`,
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/auth/users/${user._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json();
        if (data.success) {
          alert(`${newStatus === "LOCKED" ? "Khóa" : "Mở khóa"} thành công!`);
          fetchUsers();
        } else {
          alert(data.message || "Thao tác thất bại");
        }
      } catch (error) {
        alert("Lỗi kết nối server!");
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Xóa quyền quản trị của người dùng này?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/auth/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          alert("Xóa thành công!");
          fetchUsers();
        } else {
          alert(data.message || "Lỗi khi xóa!");
        }
      } catch (error) {
        alert("Lỗi kết nối server!");
      }
    }
  };

  const filteredUsers = users.filter(
    (user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    }
  );

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#9d0b0f] pb-4">
        <div>
          <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            Đội ngũ Quản trị
          </h2>
          <p className="text-[#88694f] font-medium italic">
            Quản lý tài khoản Admin và Nhân viên hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="p-3 bg-white border border-[#9d0b0f]/20 rounded-2xl text-[#9d0b0f] hover:bg-red-50 transition-colors"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-[#9d0b0f] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-[#f39200] transition-all shadow-lg"
          >
            <UserPlus size={20} /> Thêm Quản trị viên
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-100 shadow-sm rounded-4xl">
          <div className="bg-red-50 p-4 rounded-2xl text-[#9d0b0f]">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">
              Tổng Quản trị
            </p>
            <h3 className="text-2xl font-black text-[#3e2714]">
              {users.length}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-100 shadow-sm rounded-4xl">
          <div className="p-4 text-green-600 bg-green-50 rounded-2xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">
              Đang hoạt động
            </p>
            <h3 className="text-2xl font-black text-[#3e2714]">
              {users.filter((u) => u.status === "ACTIVE").length}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-100 shadow-sm rounded-4xl">
          <div className="p-4 text-yellow-600 bg-yellow-50 rounded-2xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">
              Đang bị khóa
            </p>
            <h3 className="text-2xl font-black text-[#3e2714]">
              {users.filter((u) => u.status === "LOCKED").length}
            </h3>
          </div>
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-[#9d0b0f]/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-3.5 text-[#9d0b0f]"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm quản trị viên..."
              className="w-full pl-12 pr-4 py-3.5 bg-[#f7f4ef] rounded-2xl outline-none focus:border-[#f39200] border-2 border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[160px]">
              <select
                className="w-full px-4 py-3.5 bg-[#f7f4ef] rounded-2xl outline-none focus:border-[#f39200] border-2 border-transparent transition-all font-bold text-[#3e2714]"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="min-w-[160px]">
              <select
                className="w-full px-4 py-3.5 bg-[#f7f4ef] rounded-2xl outline-none focus:border-[#f39200] border-2 border-transparent transition-all font-bold text-[#3e2714]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="LOCKED">Tạm khóa</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="overflow-hidden border border-gray-100 shadow-xl bg-white/90 rounded-4xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#9d0b0f] text-white text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-8 py-5">Thành viên</th>
                <th className="px-8 py-5">Liên hệ</th>
                <th className="px-8 py-5 text-center">Vai trò</th>
                <th className="px-8 py-5 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-20 text-center text-[#88694f]"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-20 text-center text-[#88694f]"
                  >
                    Không tìm thấy quản trị viên nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[#f7f4ef]/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#9d0b0f] text-white flex items-center justify-center font-bold shadow-md">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#3e2714]">
                            {user.fullName}
                          </p>
                          <p className="text-[10px] text-[#88694f] uppercase tracking-widest font-bold">
                            Admin ID: {user._id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm text-[#3e2714] flex items-center gap-2">
                          <Mail size={14} className="text-[#9d0b0f]" />{" "}
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-xs text-[#88694f] flex items-center gap-2">
                            <Phone size={14} className="text-[#f39200]" />{" "}
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${user.role === "ADMIN"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                          }`}
                      >
                        <Shield size={12} /> {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${user.status === "ACTIVE"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                          }`}
                      >
                        {user.status === "ACTIVE"
                          ? "ĐANG HOẠT ĐỘNG"
                          : "TẠM KHÓA"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 text-blue-500 transition-all hover:bg-blue-50 rounded-xl"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-500 transition-all hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 transition-all rounded-xl ${user.status === "ACTIVE"
                            ? "text-orange-500 hover:bg-orange-50"
                            : "text-green-500 hover:bg-green-50"
                            }`}
                          title={
                            user.status === "ACTIVE"
                              ? "Khóa tài khoản"
                              : "Mở khóa tài khoản"
                          }
                        >
                          {user.status === "ACTIVE" ? (
                            <Lock size={18} />
                          ) : (
                            <Unlock size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-[#f7f4ef] w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-zoomIn border-4 border-[#9d0b0f]/10">
            <div className="bg-[#9d0b0f] p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">
                  {editMode ? "Cập nhật Admin" : "Thêm Admin mới"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 tracking-tighter rounded-full bg-white/20 hover:bg-white/40 opacity-80"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#9d0b0f] uppercase mb-2 tracking-widest">
                    Họ và tên
                  </label>
                  <input
                    required
                    className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-transparent outline-none focus:border-[#f39200] transition-all"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#9d0b0f] uppercase mb-2 tracking-widest">
                    Email
                  </label>
                  <input
                    required
                    className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-transparent outline-none focus:border-[#f39200] transition-all"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#9d0b0f] uppercase mb-2 tracking-widest">
                      Mật khẩu
                    </label>
                    <input
                      required={!editMode}
                      className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-transparent outline-none focus:border-[#f39200] transition-all"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#9d0b0f] uppercase mb-2 tracking-widest">
                      Vai trò
                    </label>
                    <select
                      className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-transparent outline-none focus:border-[#f39200] transition-all font-bold"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                disabled={submitting}
                type="submit"
                className="w-full bg-[#9d0b0f] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#f39200] transition-all shadow-xl mt-4"
              >
                {submitting
                  ? "Đang xử lý..."
                  : editMode
                    ? "Cập nhật"
                    : "Tạo ngay"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
