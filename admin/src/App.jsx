// admin/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import ProductManagement from "./pages/ProductManagement";
import OrderManagement from "./pages/OrderManagement";
import PromotionManagement from "./pages/PromotionManagement";
import CategoryManagement from "./pages/CategoryManagement";
import ReviewManagement from "./pages/ReviewManagement";
import AdminManagement from "./pages/AdminManagement";
import ActivityLogs from "./pages/ActivityLogs";
import LoginPage from "./pages/LoginPage";
import WarehouseManagement from "./pages/WarehouseManagement";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="admins" element={<AdminManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="promotions" element={<PromotionManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="activities" element={<ActivityLogs />} />
            <Route path="warehouse" element={<WarehouseManagement />} />

          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
