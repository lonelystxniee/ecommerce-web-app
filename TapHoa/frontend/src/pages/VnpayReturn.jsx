import React, { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { useCart } from "../context/CartContext";

const VnpayReturn = () => {
  const [searchParams] = useSearchParams();
  const responseCode = searchParams.get("vnp_ResponseCode"); // "00" là thành công
  const { clearCart } = useCart();

  useEffect(() => {
    if (responseCode === "00") {
      clearCart(); // Xóa giỏ hàng khi thanh toán xong
    }
  }, [responseCode]);

  return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-md w-full border-2 border-[#9d0b0f]">
        {responseCode === "00" ? (
          <>
            <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-[#9d0b0f] uppercase tracking-tighter">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-500 mt-4 italic font-medium">
              Đơn hàng của bạn đã được ghi nhận. Hồng Lam sẽ liên hệ sớm nhất.
            </p>
          </>
        ) : (
          <>
            <XCircle size={80} className="text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-500 mt-4 font-medium">
              Giao dịch không thành công hoặc bị hủy bỏ.
            </p>
          </>
        )}
        <Link
          to="/"
          className="inline-block mt-10 bg-[#9d0b0f] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest shadow-lg hover:bg-red-800"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default VnpayReturn;
