import React from "react";
import { Minus, Plus, X, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  // Nếu giỏ hàng trống
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <ShoppingBasket size={100} className="text-gray-200" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-gray-500 mb-8">
          Hãy chọn thêm những thực phẩm tươi ngon cho gia đình nhé!
        </p>
        <Link
          to="/"
          className="bg-[#f39200] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          Đi mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Giỏ hàng ({cartItems.length})
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Danh sách sản phẩm */}
        <div className="flex-[2] space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 animate-fadeIn"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-400">{item.unit}</p>
                <p className="text-[#f39200] font-bold mt-1">
                  {item.price.toLocaleString()}đ
                </p>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 px-3 text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-700">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 px-3 text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="font-bold text-gray-800">
                  {(item.price * item.quantity).toLocaleString()}đ
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 text-xs flex items-center gap-1 hover:text-red-600 transition-colors"
                >
                  <X size={14} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tổng kết đơn hàng */}
        <div className="flex-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold mb-6">Tổng đơn hàng</h3>
            <div className="space-y-4 text-sm pb-6 border-b">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính:</span>
                <span className="font-medium text-gray-800">
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí giao hàng:</span>
                <span className="text-[#f39200] font-medium">Miễn phí</span>
              </div>
            </div>
            <div className="flex justify-between py-6">
              <span className="font-bold text-lg">Tổng cộng:</span>
              <span className="font-bold text-2xl text-red-500">
                {totalPrice.toLocaleString()}đ
              </span>
            </div>
            <Link
              to="/checkout"
              className="block text-center bg-[#f39200] text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 mb-4 transition-all active:scale-95"
            >
              Tiến hành thanh toán
            </Link>
            <Link
              to="/"
              className="block text-center text-[#f39200] font-medium text-sm hover:underline"
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
