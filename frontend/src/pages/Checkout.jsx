import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ChevronRight, CreditCard, Truck, Receipt, Tag } from "lucide-react";
import toast from "react-hot-toast";

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    fullName: savedUser.fullName || "",
    phone: savedUser.phone || "",
    email: savedUser.email || "",
    address: "",
    note: "",
    paymentMethod: "COD",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIC MÃ GIẢM GIÁ ---
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsApplying(true);
    try {
      const res = await fetch(`${API_URL}/api/promotions/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, orderValue: totalPrice }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscount(data.discountAmount);
        setAppliedCode(data.code);
        toast.success(
          `Áp dụng mã thành công! Bạn được giảm ${data.discountAmount.toLocaleString()}đ`,
        );
      } else {
        toast.error(data.message || "Mã giảm giá không hợp lệ");
        setDiscount(0);
        setAppliedCode("");
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ khuyến mãi");
    } finally {
      setIsApplying(false);
    }
  };

  // --- TỔNG TIỀN SAU GIẢM GIÁ ---
  const finalPrice = totalPrice - discount;

  const handleOrder = async () => {
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error("Vui lòng nhập đủ thông tin giao hàng!");
      return;
    }

    const orderData = {
      userId: savedUser.id || savedUser._id || null,
      customerInfo: formData,
      items: cartItems,
      totalPrice: finalPrice, // Gửi tổng tiền đã giảm giá
      discountAmount: discount,
      promoCode: appliedCode,
      paymentMethod: formData.paymentMethod,
    };

    try {
      const res = await fetch(`${API_URL}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();

      if (data.success) {
        if (formData.paymentMethod === "VNPAY") {
          // GỌI API LẤY LINK V
          //

          const resVnpay = await fetch(`${API_URL}/api/orders/vnpay-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: finalPrice, // SỐ TIỀN ĐÃ TRỪ GIẢM GIÁ
              orderId: data.orderId,
            }),
          });
          const vnpayData = await resVnpay.json();
          if (vnpayData.vnpUrl) {
            window.location.href = vnpayData.vnpUrl;
          }
        } else {
          toast.success(
            "Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.",
          );
          clearCart();
          navigate("/");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        toast.error(data.message || "Đặt hàng thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối hệ thống đặt hàng!");
    }
  };

  return (
    <div className="bg-[#f7f4ef] min-h-screen pb-20 font-sans text-[#3e2714]">
      <div className="mx-auto max-w-[1200px] px-4 pt-4">
        <div className="flex justify-center mb-12">
          <SectionHeading title="Thanh toán đơn hàng" />
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
          <div className="flex-[2] space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6 text-[#9d0b0f]">
                <Truck size={24} />
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Thông tin giao hàng
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="md:col-span-2">
                  <label className="block text-gray-500 mb-2 font-medium">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:border-[#faa519] transition-all bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-2 font-medium">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:border-[#faa519] transition-all bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-2 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:border-[#faa519] transition-all bg-gray-50/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-500 mb-2 font-medium">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường, phường/xã..."
                    className="w-full border border-gray-200 p-3 rounded-lg h-24 outline-none focus:border-[#faa519] transition-all bg-gray-50/50"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-500 mb-2 font-medium">
                    Ghi chú đơn hàng
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giao giờ hành chính..."
                    className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:border-[#faa519] transition-all bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6 text-[#9d0b0f]">
                <CreditCard size={24} />
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Phương thức thanh toán
                </h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-[#faa519] has-[:checked]:border-[#faa519] has-[:checked]:bg-orange-50/30 transition-all">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#9d0b0f]"
                  />
                  <div>
                    <p className="font-bold text-gray-800">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      Quý khách thanh toán bằng tiền mặt cho bưu tá.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-[#faa519] has-[:checked]:border-[#faa519] has-[:checked]:bg-blue-50/30 transition-all">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={formData.paymentMethod === "VNPAY"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#9d0b0f]"
                  />
                  <div className="flex items-center gap-3">
                    <img
                      src="/vnpay.png"
                      alt="VNPAY"
                      className="w-12 h-6 object-contain"
                    />
                    <span className="font-bold text-gray-800">
                      Thanh toán qua VNPAY
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TỔNG KẾT & MÃ GIẢM GIÁ */}
          <div className="flex-1">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-[#faa519]/30 sticky top-28 overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')]"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-[#9d0b0f] border-b border-dashed border-gray-200 pb-4">
                  <Receipt size={22} />
                  <h3 className="text-lg font-bold uppercase">
                    Đơn hàng của bạn
                  </h3>
                </div>

                <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar mb-6 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start text-sm border-b border-gray-50 pb-3"
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-gray-800 line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          SL: {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-[#9d0b0f]">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* --- NHẬP MÃ GIẢM GIÁ --- */}
                <div className="mb-6 p-4 bg-[#f7f4ef] rounded-2xl border border-dashed border-[#9d0b0f]/30 shadow-inner">
                  <p className="text-[10px] font-black text-[#88694f] uppercase mb-2 flex items-center gap-1">
                    <Tag size={12} /> Mã khuyến mãi
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="NHẬP MÃ..."
                      className="flex-1 p-2 rounded-lg border border-gray-300 text-xs outline-none uppercase font-bold focus:border-[#9d0b0f]"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={isApplying}
                      className="bg-[#9d0b0f] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-black transition-all disabled:bg-gray-400"
                    >
                      {isApplying ? "..." : "ÁP DỤNG"}
                    </button>
                  </div>
                  {discount > 0 && (
                    <p className="text-[10px] text-green-600 font-bold mt-2 italic flex items-center gap-1 animate-pulse">
                      ✓ Đã giảm: -{discount.toLocaleString()}đ ({appliedCode})
                    </p>
                  )}
                </div>

                {/* TỔNG TIỀN CHI TIẾT */}
                <div className="space-y-3 text-sm pb-6 border-b border-[#faa519]/20">
                  <div className="flex justify-between text-gray-500 italic">
                    <span>Tạm tính:</span>
                    <span className="font-bold text-gray-800">
                      {totalPrice.toLocaleString()}đ
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 italic font-medium">
                      <span>Giảm giá:</span>
                      <span>-{discount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500 italic">
                    <span>Phí vận chuyển:</span>
                    <span className="text-[#00b14f] font-bold uppercase text-[10px]">
                      Miễn phí
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-6">
                  <span className="font-bold text-lg text-gray-800">
                    TỔNG CỘNG:
                  </span>
                  <span className="font-black text-2xl text-[#9d0b0f]">
                    {finalPrice.toLocaleString()}đ
                  </span>
                </div>

                <button
                  onClick={handleOrder}
                  className="w-full bg-[#9d0b0f] text-white py-4 rounded-full font-bold text-lg hover:bg-red-800 shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  XÁC NHẬN ĐẶT HÀNG
                </button>

                <p className="text-[10px] text-gray-400 mt-6 text-center leading-relaxed">
                  Bằng cách nhấn đặt hàng, bạn đồng ý với{" "}
                  <span className="text-primary font-bold cursor-pointer underline">
                    Điều khoản dịch vụ
                  </span>
                </p>
                <div className="mt-4 flex justify-center">
                  <Link
                    to="/cart"
                    className="text-[#88694f] text-xs font-bold hover:underline"
                  >
                    ← Quay về giỏ hàng
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeading = ({ title }) => (
  <div className="relative z-[1] flex justify-center items-center">
    <div className="absolute top-1/2 left-[-100px] right-[-100px] h-[1px] bg-[#9d0b0f] z-[1]"></div>
    <div className="border-[#9d0b0f] relative z-[2] flex w-fit items-center border-t border-b p-[1px] bg-[#f7f4ef]">
      <img
        alt=""
        src="https://honglam.vn/_next/static/media/btn47-bg-left-hover-solid.5a0f365f.png"
        className="absolute -top-[1px] -left-[12px] h-[calc(100%+2px)] w-[14px] object-contain"
      />
      <div className="bg-[#9d0b0f] px-10 py-2 min-w-[250px] md:min-w-[350px]">
        <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider text-center">
          {title}
        </h3>
      </div>
      <img
        alt=""
        src="https://honglam.vn/_next/static/media/btn47-bg-right-hover-solid.81fa6bf3.png"
        className="absolute -top-[1px] -right-[12px] h-[calc(100%+2px)] w-[14px] object-contain"
      />
    </div>
  </div>
);

export default Checkout;
