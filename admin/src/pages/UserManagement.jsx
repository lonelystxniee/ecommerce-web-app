import React from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const UserManagement = () => {
  const users = [
    {
      id: "#1",
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0901234567",
      role: "Khách hàng",
      status: "Hoạt động",
      color: "bg-green-100",
    },
    {
      id: "#2",
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0912345678",
      role: "Khách hàng",
      status: "Hoạt động",
      color: "bg-blue-100",
    },
    {
      id: "#3",
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0923456789",
      role: "Khách hàng",
      status: "Tạm khóa",
      color: "bg-purple-100",
    },
    {
      id: "#4",
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      phone: "0934567890",
      role: "Nhân viên",
      status: "Hoạt động",
      color: "bg-orange-100",
    },
    {
      id: "#5",
      name: "Hoàng Văn E",
      email: "hoangvane@email.com",
      phone: "0945678901",
      role: "Quản lý",
      status: "Hoạt động",
      color: "bg-pink-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Quản lý người dùng
          </h2>
          <p className="text-gray-500 font-medium">
            Quản lý thông tin người dùng và phân quyền
          </p>
        </div>
        <button className="bg-[#00b14f] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-100">
          <Plus size={20} /> Thêm người dùng
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative max-w-full lg:max-w-2xl">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#00b14f] transition-all"
          />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">Người dùng</th>
                <th className="px-8 py-5">Liên hệ</th>
                <th className="px-8 py-5 text-center">Vai trò</th>
                <th className="px-8 py-5 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full ${user.color} text-[#00b14f] flex items-center justify-center font-black text-lg border-2 border-white shadow-sm`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold tracking-tighter">
                          ID: {user.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-gray-600 font-medium text-sm">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-bold">
                      {user.phone}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${
                        user.role === "Quản lý"
                          ? "bg-indigo-50 text-indigo-500"
                          : user.role === "Nhân viên"
                            ? "bg-blue-50 text-blue-500"
                            : "bg-green-50 text-green-500"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${
                        user.status === "Hoạt động"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-50 text-red-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white rounded-xl transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2.5 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="p-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 font-bold">
            Hiển thị 5 / 5 người dùng
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-[#00b14f] text-white font-bold text-sm shadow-md shadow-green-100">
              1
            </button>
            <button className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 font-bold text-sm transition-colors">
              2
            </button>
            <button className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
