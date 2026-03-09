import React from "react";
import { Minus, Plus, X, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  // Nếu giỏ hàng trống
  if (cartItems.length === 0) {
    return (
      <div className="container px-4 py-20 mx-auto text-center">
        <div className="flex justify-center mb-6">
          <ShoppingBasket size={100} className="text-section" />
        </div>
        <h2 className="mb-4 text-2xl font-bold text-section">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="mb-8 text-section">
          Hãy chọn thêm những thực phẩm tươi ngon cho gia đình nhé!
        </p>
        <Link
          to="/"
          className="bg-[#f39200] text-section text-[15px] px-8 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-20 mx-auto max-w-300">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">
        Giỏ hàng ({cartItems.length})
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Danh sách sản phẩm */}
        <div className="space-y-4 flex-2">
          {cartItems.map((item) => {
            // LOGIC SỬA LỖI ẢNH: Kiểm tra item.image hoặc lấy ảnh đầu tiên trong mảng images
            const cartImage =
              item.image || (item.images && item.images[0]) || "";

            return (
              <div
                key={item.id}
                className="flex items-center gap-6 p-6 bg-white border border-gray-100 shadow-sm rounded-2xl animate-fadeIn"
              >
                {/* HIỂN THỊ ẢNH ĐÃ FIX */}
                <img
                  src={cartImage}
                  alt={item.name}
                  className="w-24 h-24 object-contain rounded-lg border bg-[#f7f4ef]"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {item.name}
                  </h3>
                  {item.label && item.label !== "Giá gốc" && (
                    <p className="text-sm text-[#88694f] italic">
                      Loại: {item.label}
                    </p>
                  )}
                  <p className="mt-1 font-bold text-primary">
                    {item.price.toLocaleString()}đ
                  </p>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center overflow-hidden border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 px-3 text-gray-400 transition-colors hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 font-bold text-center text-gray-700">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 px-3 text-gray-400 transition-colors hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-lg font-black text-primary">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1 text-xs font-bold text-red-400 transition-colors hover:text-red-600"
                  >
                    <X size={14} /> Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tổng kết đơn hàng */}
        <div className="flex-1">
          <div className="sticky p-8 bg-white border shadow-lg rounded-4xl border-secondary/20 top-24">
            <h3 className="text-xl font-bold mb-6 text-[#3e2714] uppercase tracking-tighter">
              Tổng kết đơn hàng
            </h3>
            <div className="pb-6 space-y-4 text-sm border-b border-dashed">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính:</span>
                <span className="font-bold text-gray-800">
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí giao hàng:</span>
                <span className="text-green-600 font-bold uppercase text-[10px]">
                  Miễn phí
                </span>
              </div>
            </div>
            <div className="flex justify-between py-6">
              <span className="font-bold text-lg text-[#3e2714]">
                TỔNG CỘNG:
              </span>
              <span className="text-2xl font-black text-primary">
                {totalPrice.toLocaleString()}đ
              </span>
            </div>
            <Link
              to="/checkout"
              className="block py-4 mb-4 text-lg font-bold text-center text-white transition-all shadow-lg bg-primary rounded-2xl hover:bg-red-800 active:scale-95"
            >
              TIẾN HÀNH THANH TOÁN
            </Link>
            <Link
              to="/"
              className="block text-center text-[#88694f] font-bold text-sm hover:underline"
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
