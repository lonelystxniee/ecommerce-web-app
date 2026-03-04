import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, RefreshCcw, ShoppingBag, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (token && user.role === "ADMIN") {
            navigate("/");
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.user.role === "ADMIN") {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    navigate("/");
                } else {
                    alert("Bạn không có quyền truy cập vào hệ thống quản trị!");
                }
            } else {
                alert(data.message || "Đăng nhập thất bại");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối server!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center p-4"
            style={{ backgroundImage: `url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')` }}>
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border-4 border-[#9d0b0f]/10 animate-zoomIn">
                <div className="bg-[#9d0b0f] p-10 text-white text-center">
                    <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <ShoppingBag className="text-[#9d0b0f]" size={32} />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">ClickGo Admin</h1>
                    <p className="text-sm opacity-70 font-medium mt-1 uppercase tracking-widest text-[#faa519]">Hệ thống quản trị tinh hoa</p>
                </div>

                <form onSubmit={handleLogin} className="p-10 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] font-black uppercase text-[#88694f] mb-2 block ml-1 tracking-widest">Email Quản trị</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9d0b0f]" size={20} />
                                <input
                                    required
                                    type="email"
                                    placeholder="admin@honglam.vn"
                                    className="w-full pl-12 pr-4 py-4 bg-[#f7f4ef] rounded-2xl outline-none focus:border-[#f39200] border-2 border-transparent transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black uppercase text-[#88694f] mb-2 block ml-1 tracking-widest">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9d0b0f]" size={20} />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-[#f7f4ef] rounded-2xl outline-none focus:border-[#f39200] border-2 border-transparent transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#88694f] hover:text-[#9d0b0f]"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-[#9d0b0f] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#f39200] transition-all shadow-xl hover:shadow-[#f39200]/40 flex items-center justify-center gap-2 group disabled:bg-gray-400"
                    >
                        {loading ? (
                            <RefreshCcw className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Tiến vào hệ thống</span>
                                <Lock size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="pt-4 text-center">
                        <p className="text-xs text-[#88694f] font-medium">Bản quyền thuộc về Ô mai Hồng Lam © 2025</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
