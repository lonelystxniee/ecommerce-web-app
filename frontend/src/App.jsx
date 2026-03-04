import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { CartProvider } from "./context/CartContext";
import CategoryPage from "./pages/CategoryPage";
import ScrollToTop from "./components/ScrollToTop";
import AccountPage from "./pages/AccountPage";
import ResetPassword from "./pages/ResetPassword";
import SearchPage from "./pages/SearchPage";
import ForgotPassword from "./pages/ForgotPassword";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="bg-transparent app-container">
          <Header />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/category/:slug" element={<CategoryPage />} />

              <Route path="/account" element={<AccountPage />} />

              <Route path="/profile" element={<AccountPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </main>
          <Footer />
          <ScrollToTop />
          <Toaster
            position="top-right"
            reverseOrder={false}
            containerStyle={{
              zIndex: 99999,
            }}
            toastOptions={{
              duration: 3000,
              style: {
                background: "#fdfaf5",
                color: "#5e4027",
                border: "1px solid #800a0d",
                fontFamily: "Momo Trust Sans, sans-serif",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "12px",
                padding: "12px 24px",
                boxShadow: "0 10px 15px -3px rgba(128, 10, 13, 0.1)",
              },
              success: {
                iconTheme: {
                  primary: "#800a0d",
                  secondary: "#fdfaf5",
                },
              },
              error: {
                iconTheme: {
                  primary: "#800a0d",
                  secondary: "#fdfaf5",
                },
              },
            }}
          />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
