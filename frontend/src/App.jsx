import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages - Auth
import AdminLogin from "./pages/Admin/Login";

// Pages - Dashboard & Tables
import AdminTables from "./pages/Admin/Tables";
import MenuVerify from "./pages/Admin/Dashboard/MenuVerify";

// Pages - Menu Management
import ItemsPage from "./pages/Admin/Menu/Items";
import CategoriesPage from "./pages/Admin/Menu/Categories";
import ModifiersPage from "./pages/Admin/Menu/Modifiers";

// Pages - Customer/Guest
import GuestMenu from "./pages/Guest/Menu/index";
import CustomerLogin from "./pages/Guest/Login/index";
import CustomerRegister from "./pages/Guest/Register/index";
import GoogleCallback from "./pages/Auth/GoogleCallback";

// Pages - Waiter
import WaiterOrders from "./pages/Waiter/Orders";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* 1. LUỒNG ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/tables"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminTables />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu/items"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ItemsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu/categories"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <CategoriesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu/modifiers"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ModifiersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* 2. LUỒNG CUSTOMER */}
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/auth/google/success" element={<GoogleCallback />} />
        <Route path="/menu" element={<MenuVerify />} />
        <Route path="/menu/guest" element={<GuestMenu />} />

        {/* 3. LUỒNG WAITER */}
        <Route path="/waiter/orders" element={<WaiterOrders />} />

        {/* 4. ĐIỀU HƯỚNG MẶC ĐỊNH */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route
          path="*"
          element={
            <div className="p-10 text-center">404 - Trang không tồn tại</div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
