import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Component thông báo

// Import trang chính của bạn (nó sẽ tự tìm file index.jsx)
import AdminLogin from './pages/Admin/Login';
import AdminTables from "./pages/Admin/Tables";
import MenuVerify from "./pages/Admin/Dashboard/MenuVerify";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* --- 1. LUỒNG ADMIN / STAFF --- */}
        
        {/* Trang Login riêng cho Admin: domain/admin/login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Các trang quản trị (Sau này sẽ bọc trong PrivateRoute để check login) */}
        <Route path="/admin/tables" element={<AdminTables />} />
        
        
        {/* --- 2. LUỒNG CUSTOMER --- */}
        
        {/* Khách quét QR code -> Vào menu */}
        <Route path="/menu" element={<MenuVerify />} />


        {/* --- 3. ĐIỀU HƯỚNG MẶC ĐỊNH --- */}
        
        {/* Vào trang chủ domain.com -> Tự nhảy vào login admin (cho tiện dev lúc này) */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* 404 Not Found */}
        <Route
          path="*"
          element={<div className="p-10 text-center">404 - Trang không tồn tại</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
