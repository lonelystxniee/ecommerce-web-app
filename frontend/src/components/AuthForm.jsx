import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Check, ChevronDown } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { validateLogin, validateRegister } from "../helpers/validate";
import toast from "react-hot-toast";
import API_URL from "../config/apiConfig";

const AuthForm = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [forgotStatus, setForgotStatus] = useState("idle");
  const [forgotMessage, setForgotMessage] = useState("");

  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    birthday: "",
  });

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRegisterData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      gender: "",
      birthday: "",
    });
    setLoginErrors({});
    setRegisterErrors({});
    setForgotStatus("idle");
    setForgotMessage("");
    setShowPassword(false);
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...registerData, [name]: value };
    setRegisterData(newData);

    const errors = validateRegister(newData);
    setRegisterErrors(errors);
  };

  const handleLoginEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const errors = validateLogin({ email: value, password });
    setLoginErrors(errors);
  };

  const handleLoginPasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const errors = validateLogin({ email, password: value.trim() });
    setLoginErrors(errors);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotStatus("loading");
    setForgotMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setForgotStatus("success");
        setForgotMessage(data.message);
      } else {
        setForgotStatus("error");
        setForgotMessage(data.message || "Đã có lỗi xảy ra!");
      }
    } catch {
      setForgotStatus("error");
      setForgotMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (viewMode === "forgot") {
      return handleForgotSubmit(e);
    }

    setLoading(true);

    const url =
      viewMode === "login"
        ? `${API_URL}/api/auth/login`
        : `${API_URL}/api/auth/register`;

    const body = viewMode === "login" ? { email, password } : registerData;

    // Validate before submit
    const errors =
      viewMode === "login"
        ? validateLogin({ email, password })
        : validateRegister(registerData);

    if (Object.keys(errors).length > 0) {
      if (viewMode === "login") setLoginErrors(errors);
      else setRegisterErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          viewMode === "login"
            ? "Đăng nhập thành công!"
            : "Đăng ký thành công! Hãy đăng nhập.",
        );
        if (viewMode === "login") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          onClose();
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          resetForm();
          setViewMode("login");
        }
      } else {
        toast.error(data.message || "Thao tác thất bại!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi kết nối Server!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Đăng nhập Google thành công!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.message || "Đăng nhập Google thất bại!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi kết nối Server khi đăng nhập Google!");
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Đăng nhập Google thất bại. Vui lòng thử lại!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}></div>

      <div className="relative w-full overflow-hidden shadow-2xl z-210 max-w-120 rounded-xl animate-zoomIn bg-[url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')]">
        <button
          onClick={onClose}
          className="absolute z-30 text-gray-400 top-3 right-3 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex border-b border-gray-200/50">
          <button
            onClick={() => setViewMode("login")}
            className={`flex-1 py-5 text-xl font-bold font-seagull cursor-pointer ${viewMode === "login" || viewMode === "forgot" ? "text-[#800a0d] border-b-[3px] border-[#800a0d]" : "text-gray-500 opacity-70"}`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setViewMode("register")}
            className={`flex-1 py-5 text-xl font-bold font-seagull cursor-pointer ${viewMode === "register" ? "text-[#800a0d] border-b-[3px] border-[#800a0d]" : "text-gray-500 opacity-70"}`}
          >
            Đăng ký
          </button>
        </div>

        <div className="p-6 md:p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {viewMode === "forgot" ? (
              /* --- GIAO DIỆN QUÊN MẬT KHẨU --- */
              <div className="space-y-4">
                <div className="mb-6 text-center">
                  <h3 className="font-bold text-xl text-[#800a0d] mb-2">
                    Quên mật khẩu?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật
                    khẩu.
                  </p>
                </div>

                {forgotStatus === "success" ? (
                  <div className="p-4 text-sm text-center text-green-700 border border-green-200 rounded-lg bg-green-50">
                    {forgotMessage}
                  </div>
                ) : (
                  <>
                    <InputGroup
                      label="Email"
                      type="email"
                      placeholder="Nhập email đã đăng ký"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {forgotStatus === "error" && (
                      <p className="m-0 text-sm text-center text-red-500">
                        {forgotMessage}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={forgotStatus === "loading"}
                      className="w-full bg-[#800a0d] text-sm text-white py-2 rounded-lg font-bold shadow-md active:scale-95 disabled:bg-gray-400 mt-2 flex justify-center items-center"
                    >
                      {forgotStatus === "loading" ? (
                        <span className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></span>
                      ) : (
                        "Gửi link đặt lại mật khẩu"
                      )}
                    </button>
                  </>
                )}
              </div>
            ) : viewMode === "login" ? (
              /* --- GIAO DIỆN ĐĂNG NHẬP --- */
              <div className="space-y-4">
                <InputGroup
                  label="Email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={handleLoginEmailChange}
                  error={loginErrors.email}
                  success={email !== "" && !loginErrors.email}
                />
                <div className="relative">
                  <InputGroup
                    label="Mật khẩu"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={handleLoginPasswordChange}
                    error={loginErrors.password}
                    success={password !== "" && !loginErrors.password}
                    doubleRight
                  />
                  <div
                    className="absolute text-gray-400 cursor-pointer right-3 top-9"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>

                <div className="flex justify-end mt-1">
                  <span
                    onClick={() => {
                      setViewMode("forgot");
                      setForgotStatus("idle");
                      setForgotMessage("");
                    }}
                    className="text-sm text-[#800a0d] font-semibold cursor-pointer hover:underline"
                  >
                    Quên mật khẩu?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 text-sm font-bold text-white rounded-lg shadow-md cursor-pointer bg-primary active:scale-95 disabled:bg-gray-400"
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>

                <div className="flex items-center my-4">
                  <div className="border-t border-gray-300 grow"></div>
                  <span className="mx-4 text-sm text-gray-500">
                    Hoặc đăng nhập bằng
                  </span>
                  <div className="border-t border-gray-300 grow"></div>
                </div>

                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleFailure}
                    useOneTap
                    theme="outline"
                    shape="pill"
                    size="medium"
                  />
                </div>
              </div>
            ) : (
              /* --- GIAO DIỆN ĐĂNG KÝ --- */
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <InputGroup
                  label="Họ và tên"
                  name="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  error={registerErrors.fullName}
                  success={
                    registerData.fullName.trim() !== "" &&
                    !registerErrors.fullName
                  }
                />
                <InputGroup
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  error={registerErrors.email}
                  success={registerData.email !== "" && !registerErrors.email}
                />
                <InputGroup
                  label="Số điện thoại"
                  name="phone"
                  type="text"
                  placeholder="0987654321"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  error={registerErrors.phone}
                  success={registerData.phone !== "" && !registerErrors.phone}
                />

                <div>
                  <label className="text-sm font-bold text-[#5c4033] block mb-1.5">
                    Giới tính
                  </label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={registerData.gender}
                      onChange={handleRegisterChange}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none transition-all focus:border-[#800a0d]"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                    <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                  </div>
                </div>

                <InputGroup
                  label="Ngày sinh"
                  name="birthday"
                  type="date"
                  value={registerData.birthday}
                  onChange={handleRegisterChange}
                />

                <InputGroup
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  error={registerErrors.password}
                  success={
                    registerData.password.length >= 6 &&
                    !registerErrors.password
                  }
                />
                <InputGroup
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  error={registerErrors.confirmPassword}
                  success={
                    registerData.confirmPassword !== "" &&
                    registerData.confirmPassword === registerData.password
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 text-sm font-bold text-white rounded-lg shadow-md cursor-pointer bg-primary active:scale-95 disabled:bg-gray-400"
                >
                  {loading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
                </button>
              </div>
            )}
          </form>

          {viewMode !== "forgot" ? (
            <p className="mt-6 text-sm font-medium text-center text-gray-600">
              {viewMode === "login"
                ? "Bạn chưa có tài khoản?"
                : "Bạn đã có tài khoản?"}{" "}
              <span
                className="text-[#800a0d] font-bold cursor-pointer hover:underline"
                onClick={() =>
                  setViewMode(viewMode === "login" ? "register" : "login")
                }
              >
                {viewMode === "login" ? "Đăng ký ngay" : "Đăng nhập tại đây"}
              </span>
            </p>
          ) : (
            <p className="mt-6 text-sm font-medium text-center text-gray-600">
              <span
                className="text-[#800a0d] font-bold cursor-pointer hover:underline"
                onClick={() => {
                  resetForm();
                  setViewMode("login");
                }}
              >
                ← Quay lại đăng nhập
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, error, success, doubleRight, ...props }) => (
  <div className="relative">
    <label className="text-sm font-bold text-[#5c4033] block mb-1.5 justify-between items-center">
      <span>{label}</span>
    </label>
    <div className="relative">
      <input
        className={`w-full bg-white border rounded-lg py-2 px-3 text-sm outline-none transition-all ${error
            ? "border-red-500 bg-red-50"
            : success
              ? "border-green-500"
              : "border-gray-300 focus:border-[#800a0d]"
          }`}
        {...props}
      />

      {success && (
        <Check
          size={14}
          className={`absolute text-green-500 -translate-y-1/2 ${doubleRight ? "right-9" : "right-3"} top-1/2`}
        />
      )}
    </div>
    {error && (
      <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>
    )}
  </div>
);

export default AuthForm;
