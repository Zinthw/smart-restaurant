import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../../api/auth.api";
import toast from "react-hot-toast";
import "../../../assets/auth.css";
import "../../../assets/auth.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Forgot Password with OTP
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_saved_email");
    if (savedEmail) {
      setEmail(savedEmail);
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
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.login({ email, password });

      localStorage.setItem("admin_token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("userEmail", response.data.user.email);

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("admin_saved_email", email);
      } else {
        localStorage.removeItem("admin_saved_email");
      }

      toast.success("Đăng nhập thành công!");
      navigate("/admin/menu/items");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Đăng nhập thất bại";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error("Vui lòng nhập email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setResetLoading(true);

    try {
      // Call backend API to send OTP (backend will check if email exists)
      await authApi.sendAdminResetOTP({ email: resetEmail });
      
      setOtpSent(true);
      setCountdown(300); // 5 minutes
      toast.success("Mã OTP đã được gửi đến email của bạn!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Email không tồn tại trong hệ thống");
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 số");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setResetLoading(true);

    try {
      // Call backend API to verify OTP and reset password
      await authApi.resetAdminPasswordWithOTP({
        email: resetEmail,
        otp: otp,
        newPassword: newPassword
      });

      toast.success("Đặt lại mật khẩu thành công!");
      handleCloseForgotPassword();
      
      // Auto-fill email for convenience
      setEmail(resetEmail);
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn");
    } finally {
      setResetLoading(false);
    }
  };

  // Reset forgot password form
  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setOtpSent(false);
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setCountdown(0);
  };

  // Resend OTP
  const handleResendOTP = () => {
    setOtpSent(false);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-desktop-container">
      <div className="auth-form-card-desktop">
        
        {/* Logo & Header */}
        <div className="auth-admin-header">
          <div className="auth-admin-header-icon">🍽️</div>
          <div className="auth-admin-header-title">Smart Restaurant</div>
          <div className="auth-admin-header-subtitle">Admin Dashboard</div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label className="auth-form-label-dark">Email</label>
            <input
              type="email"
              className="auth-form-input-admin"
              placeholder="admin@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label-dark">Mật khẩu</label>
            <input
              type="password"
              className="auth-form-input-admin"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Extra Options */}
          <div className="auth-options-row">
            <label className="auth-checkbox-label">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Ghi nhớ đăng nhập
            </label>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setShowForgotPassword(true);
              }}
              className="auth-link"
            >
              Quên mật khẩu?
            </a>
          </div>

          {error && (
            <div style={{ color: "#e74c3c", fontSize: "13px", textAlign: "center", marginBottom: "15px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn-admin"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập vào Dashboard"}
          </button>
        </form>

        {/* Footer từ Mockup */}
        <div style={{ textAlign: "center", marginTop: "30px", color: "#7f8c8d", fontSize: "13px" }}>
          &copy; 2025 Smart Restaurant. All rights reserved.
        </div>
      </div>

      {/* Forgot Password Modal with OTP */}
      {showForgotPassword && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={handleCloseForgotPassword}
        >
          <div 
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "450px",
              margin: "20px",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: "10px", fontSize: "24px", color: "#2c3e50" }}>
              🔑 Đặt lại mật khẩu
            </h2>
            
            {!otpSent ? (
              // Step 1: Enter Email to send OTP
              <>
                <p style={{ color: "#7f8c8d", marginBottom: "25px", fontSize: "14px" }}>
                  Nhập email của bạn, chúng tôi sẽ gửi mã OTP để xác minh.
                </p>
                
                <form onSubmit={handleSendOTP}>
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label" style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                      Email Admin
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", outline: "none" }}
                      placeholder="admin@restaurant.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={handleCloseForgotPassword}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "white",
                        color: "#7f8c8d",
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: resetLoading ? "not-allowed" : "pointer",
                        opacity: resetLoading ? 0.7 : 1
                      }}
                    >
                      {resetLoading ? "Đang gửi..." : "Gửi mã OTP"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // Step 2: Enter OTP and New Password
              <>
                <div style={{ 
                  background: "#e7f5ff", 
                  border: "1px solid #74c0fc", 
                  borderRadius: "8px", 
                  padding: "15px", 
                  marginBottom: "20px",
                  textAlign: "center"
                }}>
                  <p style={{ margin: "5px 0", color: "#1971c2", fontSize: "14px" }}>
                    ✅ Mã OTP đã được gửi đến:<br />
                    <strong>{resetEmail}</strong>
                  </p>
                  {countdown > 0 && (
                    <p style={{ margin: "8px 0 0 0", color: "#f03e3e", fontSize: "14px", fontWeight: "600" }}>
                      ⏱️ Mã có hiệu lực trong: <strong>{formatTime(countdown)}</strong>
                    </p>
                  )}
                </div>

                <form onSubmit={handleResetPassword}>
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label" style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                      Mã OTP (6 số)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "10px", 
                        border: "1px solid #ddd", 
                        outline: "none",
                        fontSize: "20px",
                        letterSpacing: "8px",
                        textAlign: "center",
                        fontWeight: "600"
                      }}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label" style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", outline: "none" }}
                      placeholder="Ít nhất 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label" style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", outline: "none" }}
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
                      width: "100%",
                      padding: "12px",
                      background: countdown === 0 ? "#ced4da" : "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: (resetLoading || countdown === 0) ? "not-allowed" : "pointer",
                      opacity: (resetLoading || countdown === 0) ? 0.7 : 1,
                      marginBottom: "10px"
                    }}
                  >
                    {resetLoading ? "Đang xử lý..." : countdown === 0 ? "Mã OTP đã hết hạn" : "Đặt lại mật khẩu"}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "white",
                      color: "#7f8c8d",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer"
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
};

export default AdminLogin;