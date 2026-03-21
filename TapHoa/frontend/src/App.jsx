import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { CartProvider } from "./context/CartContext";
import CategoryPage from "./pages/CategoryPage";
import ScrollToTop from "./components/ScrollToTop";
import AccountPage from "./pages/AccountPage";
import VnpayReturn from "./pages/VnpayReturn";
import OrderTracking from "./pages/OrderTracking";
import LuckyWheel from "./pages/LuckyWheel";

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lucky-wheel" element={<LuckyWheel />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/category/:slug" element={<CategoryPage />} />

              <Route path="/account" element={<AccountPage />} />

              <Route path="/profile" element={<AccountPage />} />
              <Route path="/vnpay-return" element={<VnpayReturn />} />
              <Route path="/order-tracking/:id" element={<OrderTracking />} />
            </Routes>
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
