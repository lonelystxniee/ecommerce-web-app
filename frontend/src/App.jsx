import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CategoryPage from "./pages/CategoryPage";
import AccountPage from "./pages/AccountPage";
import OrderTracking from "./pages/OrderTracking";
import AdminOrders from "./pages/AdminOrders";
import ResetPassword from "./pages/ResetPassword";


import { CartProvider } from "./context/CartContext";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/profile" element={<AccountPage />} />
              <Route path="/order/:id" element={<OrderTracking />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </main>
          <Footer />
          <ScrollToTop />
          <Toaster position="top-right" />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;