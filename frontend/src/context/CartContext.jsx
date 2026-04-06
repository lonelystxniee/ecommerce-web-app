import React, { createContext, useState, useContext } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 1. Hàm thêm vào giỏ (xử lý trùng sản phẩm)
  const addToCart = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return false;
    }
    setCartItems((prev) => {
      const isExist = prev.find((item) => item.id === product.id);
      const qtyToAdd = product.quantity || 1;
      if (isExist) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qtyToAdd, selected: true }
            : item,
        );
      }
      return [...prev, { ...product, quantity: qtyToAdd, selected: true }];
    });
    return true;
  };

  // 2. Hàm thay đổi số lượng (+ / -)
  const updateQuantity = (id, amount) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item,
      ),
    );
  };

  // 2b. Hàm cập nhật số lượng trực tiếp
  const setQuantity = (id, newQty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, newQty) }
          : item,
      ),
    );
  };

  // 2c. Hàm toggle chọn sản phẩm
  const toggleSelect = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, selected: !item.selected }
          : item,
      ),
    );
  };

  // 3. Hàm xóa sản phẩm
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 4. Tính toán tổng tiền và tổng số lượng (chỉ tính những món được chọn)
  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.selected ? item.price * item.quantity : 0),
    0,
  );
  const totalItems = cartItems.reduce(
    (total, item) => total + (item.selected ? item.quantity : 0),
    0,
  );
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        setQuantity,
        toggleSelect,
        removeFromCart,
        totalPrice,
        totalItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
