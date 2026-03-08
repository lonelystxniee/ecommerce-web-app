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
  Users,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
} from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [lockedCount, setLockedCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [limit] = useState(5);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");

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
    role: "CUSTOMER",
    status: "ACTIVE",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập! Vui lòng đăng nhập với quyền Admin.");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        search: searchTerm,
        role: "CUSTOMER", // Only fetch customers here
        status: statusFilter === "ALL" ? "" : statusFilter,
        sort: sortOrder,
      });

      const response = await fetch(`${API_URL}/api/auth/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotalUsers(data.totalUsers);
        setActiveCount(data.activeCount);
        setLockedCount(data.lockedCount);
        setCustomerCount(data.customerCount);
        setAdminCount(data.adminCount);
      } else {
        alert(`Lỗi: ${data.message || "Không thể lấy danh sách người dùng"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server hoặc bạn không có quyền Admin!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [currentPage, searchTerm, statusFilter, sortOrder]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOrder]);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "CUSTOMER", // Default for new users or STAFF/ADMIN as chosen
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
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert(
          editMode ? "Cập nhật thành công!" : "Tạo người dùng thành công!",
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

    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/auth/users/${user._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
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
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/auth/users/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          alert("Xóa thành công!");
          fetchUsers();
        } else {
          alert(data.message || "Lỗi khi xóa người dùng!");
        }
      } catch (error) {
        alert("Lỗi khi xóa người dùng!");
      }
    }
  };

  const displayUsers = users;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#9d0b0f] pb-4">
        <div>
          <h2 className="text-3xl font-black text-[#9d0b0f] uppercase tracking-tighter">
            Quản lý khách hàng
          </h2>
          <p className="text-[#88694f] font-medium italic">
            Danh sách thành viên mua sắm tại Hồng Lam
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="p-3 bg-white border border-[#9d0b0f]/20 rounded-2xl text-[#9d0b0f] hover:bg-red-50 transition-colors"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Tổng khách hàng</p>
            <h3 className="text-2xl font-black text-[#3e2714]">{customerCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-50 p-4 rounded-2xl text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Hoạt động</p>
            <h3 className="text-2xl font-black text-[#3e2714]">{activeCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-yellow-50 p-4 rounded-2xl text-yellow-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Tạm khóa</p>
            <h3 className="text-2xl font-black text-[#3e2714]">{lockedCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-red-50 p-4 rounded-2xl text-red-600">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Cấp quản trị</p>
            <h3 className="text-2xl font-black text-[#3e2714]">{adminCount}</h3>
          </div>
        </div>
      </div>

      {/* Tìm kiếm */}

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
              placeholder="Tìm nhanh người dùng theo tên hoặc email..."
              className="w-full pl-12 pr-4 py-3.5 bg-[#f7f4ef] rounded-2xl outline-none focus:border-[#f39200] border-2 border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[160px]">
              <select
                className="w-full px-4 py-3.5 bg-[#f7f4ef] rounded-2xl outline-none focus:border-[#f39200] border-2 border-transparent transition-all font-bold text-[#3e2714]"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name_asc">Tên A-Z</option>
                <option value="name_desc">Tên Z-A</option>
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
                <option value="LOCKED">Bị khóa</option>
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
                <th className="px-8 py-5">Người dùng</th>
                <th className="px-8 py-5">Liên hệ</th>
                <th className="px-8 py-5 text-center">Vai trò</th>
                <th className="px-8 py-5 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCcw
                        className="animate-spin text-[#9d0b0f]"
                        size={40}
                      />
                      <p className="text-[#88694f] font-medium">
                        Đang tải dữ liệu...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : displayUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-8 py-20 text-center text-[#88694f]"
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[#f7f4ef]/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#f39200] to-[#faa519] text-white flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#3e2714]">
                            {user.fullName}
                          </p>
                          <p className="text-[10px] text-[#88694f] flex items-center gap-1">
                            <UserIcon size={10} /> ID:{" "}
                            {user._id.substring(0, 8)}...
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
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 mx-auto w-fit ${user.role === "ADMIN"
                          ? "bg-red-100 text-red-600 border border-red-200"
                          : user.role === "STAFF"
                            ? "bg-blue-100 text-blue-600 border border-blue-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                      >
                        <Shield size={12} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold mx-auto w-fit block ${user.status === "ACTIVE"
                          ? "bg-green-100 text-green-600 border border-green-200"
                          : "bg-yellow-100 text-yellow-600 border border-yellow-200"
                          }`}
                      >
                        {user.status === "ACTIVE"
                          ? "ĐANG HOẠT ĐỘNG"
                          : "BỊ KHÓA"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 text-blue-500 transition-all hover:bg-blue-50 rounded-xl"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-500 transition-all hover:bg-red-50 rounded-xl"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 transition-all rounded-xl ${user.status === "ACTIVE"
                            ? "text-orange-500 hover:bg-orange-50"
                            : "text-green-500 hover:bg-green-50"
                            }`}
                          title={user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {user.status === "ACTIVE" ? <Lock size={18} /> : <Unlock size={18} />}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 mt-8 md:flex-row">
          <p className="text-sm font-medium text-[#88694f]">
            Hiển thị <span className="font-bold text-[#3e2714]">{displayUsers.length}</span> trên <span className="font-bold text-[#3e2714]">{totalUsers}</span> người dùng
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-4 py-2 text-sm font-bold text-[#9d0b0f] bg-white border border-[#9d0b0f]/20 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${currentPage === pageNum
                        ? "bg-[#9d0b0f] text-white"
                        : "bg-white text-[#9d0b0f] border border-[#9d0b0f]/20 hover:bg-red-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  (pageNum === 2 && currentPage > 3) ||
                  (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <span key={pageNum} className="px-1 text-[#88694f]">...</span>;
                }
                return null;
              })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 text-sm font-bold text-[#9d0b0f] bg-white border border-[#9d0b0f]/20 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA NGƯỜI DÙNG */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-100">
          <div
            className="absolute inset-0 transition-opacity bg-black/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-[#f7f4ef] w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-zoomIn border-4 border-[#9d0b0f]/10 translate-y-0">
            <div className="bg-[#9d0b0f] p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">
                  {editMode ? "Cập nhật thông tin" : "Thêm quản trị viên mới"}
                </h3>
                <p className="h-4 mt-1 text-xs font-medium text-white/70">
                  {editMode
                    ? `Đang chỉnh sửa cho ID: ${selectedUserId.substring(0, 10)}...`
                    : "Tạo tài khoản quản trị hệ thống"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 transition-colors rounded-full bg-white/20 hover:bg-white/40"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#9d0b0f] uppercase mb-2 tracking-widest">
                    Họ và tên
                  </label>
                  <input
                    required
                    className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-transparent outline-none focus:border-[#f39200] transition-all shadow-sm font-medium"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#9d0b0f] uppercase mb-2 tracking-widest">
                    Email đăng nhập
                  </label>
                  <input
                    required
                    className="w-full px-5 py-4 bg-gray-100 text-gray-500 rounded-2xl border-2 border-transparent outline-none focus:border-[#f39200] transition-all shadow-sm font-medium"
                    type="email"
                    placeholder="example@gmail.com"
                    disabled
                    value={formData.email}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-[#9d0b0f] uppercase mb-2 tracking-widest">
                      Số điện thoại
                    </label>
                    <input
                      className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-transparent outline-none focus:border-[#f39200] transition-all shadow-sm font-medium"
                      type="text"
                      placeholder="0123..."
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#9d0b0f] uppercase mb-2 tracking-widest">
                      {editMode ? "Mật khẩu mới (nếu cần)" : "Mật khẩu"}
                    </label>
                    <input
                      required={!editMode}
                      className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-transparent outline-none focus:border-[#f39200] transition-all shadow-sm font-medium"
                      type="password"
                      placeholder="******"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-[10px] font-black text-[#9d0b0f] uppercase mb-2 tracking-widest">
                      Vai trò hệ thống
                    </label>
                    <select
                      className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-transparent outline-none focus:border-[#f39200] transition-all shadow-sm font-bold text-[#3e2714]"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="CUSTOMER">Khách hàng</option>
                      <option value="ADMIN">Quản trị viên</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#9d0b0f] uppercase mb-2 tracking-widest">
                      Trạng thái
                    </label>
                    <select
                      className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-transparent outline-none focus:border-[#f39200] transition-all shadow-sm font-bold text-[#3e2714]"
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
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="w-full bg-[#9d0b0f] text-white py-5 rounded-[20px] font-black uppercase tracking-widest hover:bg-[#f39200] transition-all shadow-xl hover:shadow-[#f39200]/40 mt-6 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCcw className="animate-spin" size={20} />
                    Đang xử lý...
                  </>
                ) : editMode ? (
                  "Cập nhật ngay"
                ) : (
                  "Tạo quản trị viên"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
