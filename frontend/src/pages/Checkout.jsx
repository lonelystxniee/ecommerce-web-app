import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ChevronRight, CreditCard, Truck, Receipt } from "lucide-react";
import toast from "react-hot-toast";

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  // 1. Lấy thông tin user từ localStorage nếu đã đăng nhập
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  // 2. State quản lý Form
  const [formData, setFormData] = useState({
    fullName: savedUser.fullName || "",
    phone: savedUser.phone || "",
    email: savedUser.email || "",
    address: "",
    note: "",
    paymentMethod: "COD",
  });

  // 3. Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Hàm xử lý đặt hàng
  const handleOrder = async () => {
    // Kiểm tra dữ liệu
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error("Vui lòng điền đầy đủ các thông tin có dấu (*)");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống, không thể đặt hàng!");
      return;
    }

    // Chuẩn bị dữ liệu gửi lên Backend
    const orderData = {
      userId: savedUser.id || savedUser._id || null,
      customerInfo: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        note: formData.note,
      },
      items: cartItems,
      totalPrice: totalPrice,
      paymentMethod: formData.paymentMethod,
    };

    try {
      const response = await fetch("http://localhost:5175/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Đặt hàng thành công! Cảm ơn bạn đã ủng hộ Hồng Lam.");
        if (clearCart) clearCart(); // Xóa giỏ hàng nếu có hàm clear
        navigate("/");
        setTimeout(() => {
          window.location.reload(); // Reload để reset giỏ hàng hoàn toàn
        }, 2000);
      } else {
        toast.error("Có lỗi: " + data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến Server!");
      console.log(error);
    }
  };

  return (
    <div className="bg-[#f7f4ef] min-h-screen pb-20 font-sans text-[#3e2714]">
      <div className="px-4 pt-4 mx-auto max-w-300">
        <div className="flex justify-center mb-12">
          <SectionHeading title="Thanh toán đơn hàng" />
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="space-y-8 flex-2">
            <div className="relative p-8 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Truck size={24} />
                <h3 className="text-xl font-bold tracking-tight uppercase">
                  Thông tin giao hàng
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 text-sm md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-500">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className="w-full p-3 transition-all border border-gray-200 rounded-lg outline-none focus:border-secondary bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-500">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full p-3 transition-all border border-gray-200 rounded-lg outline-none focus:border-secondary bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-500">
                    Email (Để nhận thông tin đơn hàng)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full p-3 transition-all border border-gray-200 rounded-lg outline-none focus:border-secondary bg-gray-50/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-500">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường, phường/xã..."
                    className="w-full h-24 p-3 transition-all border border-gray-200 rounded-lg outline-none focus:border-secondary bg-gray-50/50"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-500">
                    Ghi chú đơn hàng
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giao giờ hành chính..."
                    className="w-full p-3 transition-all border border-gray-200 rounded-lg outline-none focus:border-secondary bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Khối Phương thức thanh toán */}
            <div className="p-8 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <CreditCard size={24} />
                <h3 className="text-xl font-bold tracking-tight uppercase">
                  Phương thức thanh toán
                </h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 transition-all border-2 border-gray-100 cursor-pointer rounded-xl hover:border-secondary has-checked:border-secondary has-checked:bg-orange-50/30">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-primary"
                  />
                  <div>
                    <p className="font-bold text-gray-800">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-xs italic text-gray-500">
                      Quý khách thanh toán bằng tiền mặt cho nhân viên giao
                      hàng.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 transition-all border-2 border-gray-100 cursor-pointer rounded-xl hover:border-secondary has-checked:border-secondary has-checked:bg-orange-50/30">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Bank Transfer"
                    checked={formData.paymentMethod === "Bank Transfer"}
                    onChange={handleChange}
                    className="w-5 h-5 accent-primary"
                  />
                  <div>
                    <p className="font-bold text-gray-800">
                      Chuyển khoản ngân hàng
                    </p>
                    <p className="text-xs italic text-gray-500">
                      Thực hiện chuyển khoản vào số tài khoản của Hồng Lam.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG (DỮ LIỆU THẬT) */}
          <div className="flex-1">
            <div className="sticky p-8 overflow-hidden bg-white border shadow-lg rounded-xl border-secondary/30 top-28">
              {/* Trang trí vân giấy ở nền */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/paper.png')]"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 pb-4 mb-6 border-b border-gray-200 border-dashed text-primary">
                  <Receipt size={22} />
                  <h3 className="text-lg font-bold uppercase">
                    Đơn hàng của bạn
                  </h3>
                </div>

                {/* Danh sách sản phẩm từ CartContext */}
                <div className="pr-2 mb-6 space-y-4 overflow-y-auto max-h-75 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between pb-3 text-sm border-b border-gray-50"
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-gray-800 line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-primary">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tính toán tiền */}
                <div className="pb-6 space-y-3 text-sm border-b border-secondary/20">
                  <div className="flex justify-between italic text-gray-500">
                    <span>Tạm tính:</span>
                    <span className="font-bold text-gray-800">
                      {totalPrice.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex justify-between italic text-gray-500">
                    <span>Phí vận chuyển:</span>
                    <span className="text-[#00b14f] font-bold uppercase text-[10px]">
                      Miễn phí
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-6">
                  <span className="text-lg font-bold text-gray-800">
                    TỔNG CỘNG:
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {totalPrice.toLocaleString()}đ
                  </span>
                </div>

                <button
                  onClick={handleOrder}
                  className="flex items-center justify-center w-full gap-2 py-4 text-lg font-bold text-white transition-all rounded-full shadow-lg bg-primary hover:bg-red-800 shadow-red-100 active:scale-95"
                >
                  XÁC NHẬN ĐẶT HÀNG
                </button>

                <p className="text-[10px] text-gray-400 mt-6 text-center leading-relaxed">
                  Bằng cách nhấn đặt hàng, bạn đồng ý với{" "}
                  <span className="font-bold underline cursor-pointer text-primary">
                    Điều khoản dịch vụ
                  </span>{" "}
                  của chúng tôi
                </p>
                <div className="flex justify-center mt-4">
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
  <div className="relative flex items-center justify-center z-1">
    <div className="absolute h-px top-1/2 -left-25 -right-25 bg-primary z-1"></div>
    <div className="border-primary relative z-2 flex w-fit items-center border-t border-b p-px bg-[#f7f4ef]">
      <img
        alt=""
        src="https://honglam.vn/_next/static/media/btn47-bg-left-hover-solid.5a0f365f.png"
        className="absolute -top-px -left-3 h-[calc(100%+2px)] w-3.5 object-contain"
      />
      <div className="bg-primary px-10 py-2 min-w-62.5 md:min-w-87.5">
        <h3 className="text-xl font-bold tracking-wider text-center text-white uppercase md:text-2xl">
          {title}
        </h3>
      </div>
      <img
        alt=""
        src="https://honglam.vn/_next/static/media/btn47-bg-right-hover-solid.81fa6bf3.png"
        className="absolute -top-px -right-3 h-[calc(100%+2px)] w-3.5 object-contain"
      />
    </div>
  </div>
);

export default Checkout;
