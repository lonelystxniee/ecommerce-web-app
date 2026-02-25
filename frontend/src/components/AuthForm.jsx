import React, { useState } from "react";
import { X, Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";

const AuthForm = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // State cho Đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State cho Đăng ký
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Xử lý thay đổi input cho Đăng ký
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý chung khi submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isLogin
      ? "http://localhost:5175/api/auth/login"
      : "http://localhost:5175/api/auth/register";

    const body = isLogin ? { email, password } : registerData;

    // Kiểm tra mật khẩu khớp khi đăng ký
    if (!isLogin && registerData.password !== registerData.confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          isLogin
            ? "Đăng nhập thành công!"
            : "Đăng ký thành công! Hãy đăng nhập.",
        );
        if (isLogin) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          onClose();
          window.location.reload();
        } else {
          setIsLogin(true); // Chuyển sang tab đăng nhập sau khi đăng ký xong
        }
      } else {
        alert(data.message || "Thao tác thất bại!");
      }
    } catch (error) {
      alert("Lỗi kết nối Server!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-200">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      ></div>

      <div
        className="relative w-full overflow-hidden shadow-2xl z-210 max-w-120 rounded-xl animate-zoomIn"
        style={{
          backgroundColor: "#f2ebe3",
          backgroundImage: `url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute z-30 text-gray-400 top-3 right-3 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex border-b border-gray-200/50">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-5 text-xl font-bold ${isLogin ? "text-[#800a0d] border-b-[3px] border-[#800a0d]" : "text-gray-500 opacity-70"}`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-5 text-xl font-bold ${!isLogin ? "text-[#800a0d] border-b-[3px] border-[#800a0d]" : "text-gray-500 opacity-70"}`}
          >
            Đăng ký
          </button>
        </div>

        <div className="p-6 md:p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isLogin ? (
              /* --- GIAO DIỆN ĐĂNG NHẬP --- */
              <div className="space-y-4">
                <InputGroup
                  label="Email"
                  type="email"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <InputGroup
                    label="Mật khẩu"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div
                    className="absolute text-gray-400 cursor-pointer right-3 top-9"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#800a0d] text-white py-3 rounded-lg font-bold shadow-md active:scale-95 disabled:bg-gray-400"
                >
                  {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
                </button>
              </div>
            ) : (
              /* --- GIAO DIỆN ĐĂNG KÝ (MỚI) --- */
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <InputGroup
                  label="Họ và tên"
                  name="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                />
                <InputGroup
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                />
                <InputGroup
                  label="Số điện thoại"
                  name="phone"
                  type="text"
                  placeholder="098..."
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                />
                <InputGroup
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                />
                <InputGroup
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#800a0d] text-white py-3 rounded-lg font-bold shadow-md active:scale-95 disabled:bg-gray-400 mt-2"
                >
                  {loading ? "Đang đăng ký..." : "ĐĂNG KÝ TÀI KHOẢN"}
                </button>
              </div>
            )}
          </form>

          <p className="mt-6 text-sm font-medium text-center text-gray-600">
            {isLogin ? "Bạn chưa có tài khoản?" : "Bạn đã có tài khoản?"}{" "}
            <span
              className="text-[#800a0d] font-bold cursor-pointer hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập tại đây"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Component con để tái sử dụng Input
const InputGroup = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-bold text-[#5c4033] block mb-1.5">
      {label}
    </label>
    <input
      required
      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-[#800a0d] transition-all"
      {...props}
    />
  </div>
);

export default AuthForm;
