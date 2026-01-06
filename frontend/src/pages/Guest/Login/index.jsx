import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '../../../api/auth.api';
import '../../../assets/guest.css';
import '../../../assets/auth.css';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneOrEmail: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Forgot Password with OTP
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetContact, setResetContact] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedContact = localStorage.getItem('guest_saved_contact');
    if (savedContact) {
      setFormData({ ...formData, phoneOrEmail: savedContact });
      setRememberMe(true);
    }
  }, []);

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.phoneOrEmail || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      setLoading(false);
      return;
    }

    try {
      // Call real API - will use mock data if backend not ready
      const response = await authApi.customerLogin(formData);
      
      // Save JWT and customer info
      localStorage.setItem("customerToken", response.data.token);
      localStorage.setItem("customerInfo", JSON.stringify(response.data.customer));
      
      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('guest_saved_contact', formData.phoneOrEmail);
      } else {
        localStorage.removeItem('guest_saved_contact');
      }
      
      toast.success(`Chào mừng trở lại, ${response.data.customer.fullName}!`);
      
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
            id: "cust-001",
            fullName: "Nguyễn Văn A",
            phone: "0909123456",
            tier: "bronze",
            totalPoints: 120
          }
        };

        localStorage.setItem("customerToken", mockResponse.token);
        localStorage.setItem("customerInfo", JSON.stringify(mockResponse.customer));
        
        if (rememberMe) {
          localStorage.setItem('guest_saved_contact', formData.phoneOrEmail);
        }
        
        toast.success(`Chào mừng trở lại, ${mockResponse.customer.fullName}! (Mock Mode)`);
        navigate('/menu/guest');
      } else {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to contact (email or phone)
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!resetContact) {
      toast.error('Vui lòng nhập email hoặc số điện thoại');
      return;
    }

    setResetLoading(true);

    try {
      // Call backend API to send OTP (backend will check if contact exists)
      await authApi.sendCustomerResetOTP({ contact: resetContact });
      
      setOtpSent(true);
      setCountdown(300); // 5 minutes
      toast.success('Mã OTP đã được gửi!');
    } catch (err) {
      // If backend not ready, allow to continue for development
      if (err.code === 'ERR_NETWORK' || err.response?.status === 404) {
        console.warn('Backend not ready, simulating OTP send...');
        toast.success('Mã OTP đã được gửi! (Mock Mode)');
        setOtpSent(true);
        setCountdown(300);
      } else {
        toast.error(err.response?.data?.message || 'Email/SĐT không tồn tại trong hệ thống');
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Vui lòng nhập mã OTP 6 số');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setResetLoading(true);

    try {
      // Call backend API to verify OTP and reset password
      await authApi.resetCustomerPasswordWithOTP({
        contact: resetContact,
        otp: otp,
        newPassword: newPassword
      });

      toast.success('Đặt lại mật khẩu thành công!');
      handleCloseForgotPassword();
      
      // Auto-fill contact for convenience
      setFormData({ phoneOrEmail: resetContact, password: '' });
    } catch (err) {
      // If backend not ready, simulate success
      if (err.code === 'ERR_NETWORK' || err.response?.status === 404) {
        console.warn('Backend not ready, simulating password reset...');
        toast.success('Đặt lại mật khẩu thành công! (Mock Mode)');
        handleCloseForgotPassword();
        setFormData({ phoneOrEmail: resetContact, password: '' });
      } else {
        toast.error(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn');
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Reset forgot password form
  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setOtpSent(false);
    setResetContact('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setCountdown(0);
  };

  // Resend OTP
  const handleResendOTP = () => {
    setOtpSent(false);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Google OAuth Login
  const handleGoogleLogin = () => {
    toast.error('Tính năng đăng nhập Google cần backend hỗ trợ.');
    console.log('🔴 CẦN BACKEND: Google OAuth - Xem backend/OTP_BACKEND_REQUIREMENTS.md để biết hướng dẫn chi tiết');
    
    // Khi backend đã sẵn sàng, uncomment dòng dưới:
    // window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="auth-mobile-container">
      {/* Logo Section */}
      <div className="auth-logo-section">
        <div className="auth-logo-icon">🍽️</div>
        <div className="auth-logo-title">Smart Restaurant</div>
        <div className="auth-logo-subtitle">Scan. Order. Enjoy.</div>
      </div>

      {/* Login Form Section */}
      <div className="auth-form-card">
        <h2 className="auth-form-title">Chào mừng trở lại</h2>

        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label className="auth-form-label">Email hoặc Số điện thoại</label>
            <input 
              type="text" 
              className="auth-form-input" 
              placeholder="0909xxxxxx hoặc you@example.com"
              required
              value={formData.phoneOrEmail}
              onChange={(e) => setFormData({...formData, phoneOrEmail: e.target.value})}
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="auth-form-input" 
              placeholder="Nhập mật khẩu"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="auth-options-row">
            <label className="auth-checkbox-label">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Ghi nhớ đăng nhập
            </label>
            <span 
              onClick={() => setShowForgotPassword(true)}
              className="auth-link"
            >
              Quên mật khẩu?
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">hoặc</span>
          <div className="auth-divider-line"></div>
        </div>

        {/* Social Login */}
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
          Tiếp tục với Google
        </button>

        {/* Sign Up Link */}
        <div className="auth-footer-text">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="auth-footer-link">
            Đăng ký
          </Link>
        </div>

        {/* Continue as Guest */}
        <div className="auth-guest-link">
          <Link to="/menu/guest">
            Tiếp tục với tư cách khách vãng lai &#8594;
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal with OTP */}
      {showForgotPassword && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={handleCloseForgotPassword}
        >
          <div 
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '22px', color: '#2c3e50' }}>🔑 Đặt lại mật khẩu</h2>
            
            {!otpSent ? (
              // Step 1: Enter Contact to send OTP
              <>
                <p style={{ color: '#7f8c8d', marginBottom: '20px', fontSize: '14px' }}>
                  Nhập email hoặc số điện thoại, chúng tôi sẽ gửi mã OTP để xác minh.
                </p>
                
                <form onSubmit={handleSendOTP}>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                      Email hoặc Số điện thoại
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none' }}
                      placeholder="0909xxxxxx hoặc you@example.com"
                      value={resetContact}
                      onChange={(e) => setResetContact(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleCloseForgotPassword}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'white',
                        color: '#7f8c8d',
                        border: '1px solid #dfe6e9',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: resetLoading ? 'not-allowed' : 'pointer',
                        opacity: resetLoading ? 0.7 : 1
                      }}
                    >
                      {resetLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // Step 2: Enter OTP and New Password
              <>
                <div style={{ 
                  background: '#e7f5ff', 
                  border: '1px solid #74c0fc', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '5px 0', color: '#1971c2', fontSize: '13px' }}>
                    ✅ Mã OTP đã được gửi đến:<br />
                    <strong>{resetContact}</strong>
                  </p>
                  {countdown > 0 && (
                    <p style={{ margin: '8px 0 0 0', color: '#f03e3e', fontSize: '13px', fontWeight: '600' }}>
                      ⏱️ Mã có hiệu lực trong: <strong>{formatTime(countdown)}</strong>
                    </p>
                  )}
                </div>

                <form onSubmit={handleResetPassword}>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                      Mã OTP (6 số)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #dfe6e9', 
                        outline: 'none',
                        fontSize: '18px',
                        letterSpacing: '6px',
                        textAlign: 'center',
                        fontWeight: '600'
                      }}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none' }}
                      placeholder="Ít nhất 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none' }}
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || countdown === 0}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: countdown === 0 ? '#ced4da' : '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: (resetLoading || countdown === 0) ? 'not-allowed' : 'pointer',
                      opacity: (resetLoading || countdown === 0) ? 0.7 : 1,
                      marginBottom: '10px'
                    }}
                  >
                    {resetLoading ? 'Đang xử lý...' : countdown === 0 ? 'Mã OTP đã hết hạn' : 'Đặt lại mật khẩu'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'white',
                      color: '#7f8c8d',
                      border: '1px solid #dfe6e9',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ← Gửi lại mã OTP
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}