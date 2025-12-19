import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 

export default function AdminLayout({ children }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  // Hàm render link: Nếu không phải '/admin/tables' thì disable
  const renderNavLink = (to, icon, label, badge = null) => {
    // Chỉ cho phép link Tables hoạt động
    const isAllowed = to === '/admin/tables'; 
    
    return (
      <Link 
        to={isAllowed ? to : '#'} // Nếu không được phép thì link là dấu #
        className={`nav-link ${isActive(to)}`}
        style={{
          // Style cho link bị disable
          opacity: isAllowed ? 1 : 0.5, 
          cursor: isAllowed ? 'pointer' : 'not-allowed',
          background: isAllowed ? '' : 'transparent', // Xóa hiệu ứng hover của link disable
        }}
        onClick={(e) => {
          if (!isAllowed) {
            e.preventDefault(); // Chặn hành động chuyển trang
          }
        }}
      >
        <span className="nav-icon">{icon}</span> 
        {label}
        {badge && <span className="nav-badge" style={{opacity: 0.5}}>{badge}</span>}
      </Link>
    );
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-logo">
          <span style={{ fontSize: '30px' }}>🍽️</span>
          <span>Smart Restaurant</span>
        </div>

        <nav className="sidebar-nav">
          {/* Gọi hàm renderNavLink để tạo các link */}
          {renderNavLink('/admin/dashboard', '📊', 'Dashboard')}
          {renderNavLink('/admin/orders', '📋', 'Orders', '5')}
          {renderNavLink('/admin/menu', '🍔', 'Menu Items')}
          
          {renderNavLink('/admin/tables', '🪑', 'Tables')}
          
          {renderNavLink('/admin/reports', '📈', 'Reports')}
          {renderNavLink('/admin/kds', '📺', 'Kitchen Display')}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">JD</div>
            <div className="admin-info">
              <div className="admin-name">John Doe</div>
              <div className="admin-role">Restaurant Admin</div>
            </div>
          </div>
          <Link to="#" className="logout-link" style={{opacity: 0.5, cursor: 'not-allowed'}}>🚪 Logout</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <Toaster position="top-right" /> 
        {children}
      </div>
    </div>
  );
}