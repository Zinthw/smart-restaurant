import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import AdminLayout from "./components/layout/AdminLayout"; 

// Pages - Auth
import AdminLogin from './pages/Admin/Login';

// Pages - Dashboard & Tables
import AdminTables from "./pages/Admin/Tables";
import MenuVerify from "./pages/Admin/Dashboard/MenuVerify"; 

// Pages - Menu Management
import ItemsPage from "./pages/Admin/Menu/Items";
import CategoriesPage from "./pages/Admin/Menu/Categories";
import ModifiersPage from "./pages/Admin/Menu/Modifiers";

// Pages - Customer/Guest (Đồng bộ dùng tên Customer)
import GuestMenu from "./pages/Guest/Menu/index";
import CustomerLogin from "./pages/Guest/Login/index"; 

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* --- 1. LUỒNG ADMIN / STAFF --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/tables" element={<AdminLayout><AdminTables /></AdminLayout>} />
        <Route path="/admin/menu/items" element={<AdminLayout><ItemsPage /></AdminLayout>} />
        <Route path="/admin/menu/categories" element={<AdminLayout><CategoriesPage /></AdminLayout>} />
        <Route path="/admin/menu/modifiers" element={<AdminLayout><ModifiersPage /></AdminLayout>} />
        
        {/* --- 2. LUỒNG CUSTOMER (KHÁCH HÀNG) --- */}
        
        {/* CustomerLogin */}
        <Route path="/customer/login" element={<CustomerLogin />} />

        {/* Cổng xác thực QR Code */}
        <Route path="/menu" element={<MenuVerify />} />

        {/* Trang thực đơn chính cho khách */}
        <Route path="/menu/guest" element={<GuestMenu />} />

        {/* --- 3. ĐIỀU HƯỚNG MẶC ĐỊNH --- */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        
        <Route
          path="*"
          element={<div className="p-10 text-center">404 - Trang không tồn tại</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;