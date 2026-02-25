// admin/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import ProductManagement from "./pages/ProductManagement";
import OrderManagement from "./pages/OrderManagement";
import PromotionManagement from "./pages/PromotionManagement";

function App() {
  return (
    <Router>
      <Routes>
        {/* Tất cả các trang admin đều nằm bên trong AdminLayout để giữ Sidebar cố định */}
        <Route path="/" element={<AdminLayout />}>
          {/* Trang mặc định khi vào localhost:5174/ là Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Các trang quản lý khác */}
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
