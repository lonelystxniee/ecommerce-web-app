import React, { useState } from "react";
import { API_URL } from "../config/apiConfig";
import { Link } from "react-router-dom";
import { ChevronRight, Mail, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email của bạn");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast.success("Yêu cầu đã được gửi!");
      } else {
        toast.error(data.message || "Đã có lỗi xảy ra");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi kết nối Server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-auto pt-4 pb-20 bg-[url('https://honglam.vn/_next/static/media/bg-body.9bfd1cb8.png')] min-h-[70vh]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-4 mx-auto mb-10 font-bold text-[#88694f] text-xs max-w-300">
        <Link to="/" className="hover:text-[#800a0d] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#800a0d]">Quên mật khẩu</span>
      </div>

      <div className="max-w-md px-6 py-12 mx-auto bg-white border border-gray-100 shadow-2xl rounded-3xl animate-zoomIn">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-50 text-[#800a0d]">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-black text-[#800a0d] tracking-tight mb-3">
            Quên mật khẩu?
          </h1>
          <p className="text-sm italic font-medium text-gray-500">
            {submitted
              ? "Hãy kiểm tra hộp thư đến của bạn để thực hiện các bước tiếp theo."
              : "Nhập email của bạn để nhận liên kết đặt lại mật khẩu mới cho tài khoản ClickGo của bạn."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block pl-1 text-[13px] font-black text-text-primary uppercase tracking-wider">
                Địa chỉ email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-5 py-4 bg-[#fdfaf5] border border-gray-100 rounded-2xl outline-none focus:border-[#800a0d] focus:bg-white transition-all font-bold text-[#3e2714]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800a0d] text-white py-4 rounded-[30px] font-black text-sm shadow-xl shadow-red-900/10 hover:rounded-sm transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Gửi link đặt lại mật khẩu"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="p-4 border border-green-100 bg-green-50 rounded-2xl">
              <p className="text-sm font-bold text-green-700">
                Chúng tôi đã gửi link đặt lại mật khẩu tới hòm thư: <br />
                <span className="text-[#800a0d]">{email}</span>
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="text-[#88694f] text-sm font-bold hover:text-[#800a0d] transition-colors"
            >
              Chưa nhận được email? Gử lại
            </button>
          </div>
        )}

        <div className="pt-6 mt-10 text-center border-t border-gray-100">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#88694f] text-sm font-bold hover:text-[#800a0d] transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
