import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '../../../api/auth.api';
import '../../../assets/guest.css';
import '../../../assets/auth.css';

export default function CustomerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate
    if (!formData.fullName || !formData.phone || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      setLoading(false);
      return;
    }

    if (formData.phone.length < 10) {
      toast.error('Số điện thoại không hợp lệ');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      // Call real API - will use mock data if backend not ready
      const response = await authApi.customerRegister({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || null,
        password: formData.password
      });
      
      // Save JWT and customer info
      localStorage.setItem("customerToken", response.data.token);
      localStorage.setItem("customerInfo", JSON.stringify(response.data.customer));
      
      toast.success(`Đăng ký thành công! Chào mừng ${response.data.customer.fullName}!`);
      
      // Navigate to Guest Menu
      navigate('/menu/guest');

    } catch (error) {
      // If backend not ready, use mock data for development
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('Backend not ready, using mock data...');
        
        // MOCK DATA for development
        const mockResponse = {
          token: "MOCK_CUSTOMER_JWT_TOKEN",
          customer: {
            id: "cust-new-001",
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email || null,
            tier: "bronze",
            totalPoints: 0
          }
        };

        localStorage.setItem("customerToken", mockResponse.token);
        localStorage.setItem("customerInfo", JSON.stringify(mockResponse.customer));
        
        toast.success(`Đăng ký thành công! Chào mừng ${mockResponse.customer.fullName}! (Mock Mode)`);
        navigate('/menu/guest');
      } else {
        toast.error(error.response?.data?.message || "Đăng ký thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.error('Tính năng đăng nhập Google cần backend hỗ trợ.');
    console.log('🔴 CẦN BACKEND: Google OAuth - Xem backend/GOOGLE_OAUTH_BACKEND_GUIDE.md để biết hướng dẫn chi tiết');
    
    // Khi backend đã sẵn sàng, uncomment dòng dưới:
    // window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="auth-mobile-container">
      {/* Logo Section */}
      <div className="auth-logo-section">
        <div className="auth-logo-icon">🍽️</div>
        <div className="auth-logo-title">Smart Restaurant</div>
        <div className="auth-logo-subtitle">Tạo tài khoản để nhận ưu đãi đặc biệt</div>
      </div>

      {/* Register Form Section */}
      <div className="auth-form-card">
        <h2 className="auth-form-title">Đăng ký tài khoản</h2>

        <form onSubmit={handleRegister}>
          <div className="auth-form-group-compact">
            <label className="auth-form-label">Họ và tên *</label>
            <input
              type="text"
              name="fullName"
              className="auth-form-input"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="auth-form-group-compact">
            <label className="auth-form-label">Số điện thoại *</label>
            <input
              type="tel"
              name="phone"
              className="auth-form-input"
              placeholder="0909123456"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10,11}"
            />
          </div>

          <div className="auth-form-group-compact">
            <label className="auth-form-label">Email (tùy chọn)</label>
            <input
              type="email"
              name="email"
              className="auth-form-input"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-form-group-compact">
            <label className="auth-form-label">Mật khẩu *</label>
            <input
              type="password"
              name="password"
              className="auth-form-input"
              placeholder="Ít nhất 6 ký tự"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label">Xác nhận mật khẩu *</label>
            <input
              type="password"
              name="confirmPassword"
              className="auth-form-input"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">hoặc</span>
          <div className="auth-divider-line"></div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="auth-google-btn"
        >
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Đăng ký với Google
        </button>

        {/* Sign In Link */}
        <div className="auth-footer-text">
          Đã có tài khoản?{' '}
          <Link to="/login" className="auth-footer-link">
            Đăng nhập
          </Link>
        </div>

        {/* Continue as Guest */}
        <div className="auth-guest-link">
          <Link to="/menu/guest">
            Tiếp tục với tư cách khách vãng lai &#8594;
          </Link>
        </div>
      </div>
    </div>
  );
}
