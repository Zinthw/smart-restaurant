import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      setLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@example.com' && password === 'admin123') {
        localStorage.setItem('accessToken', 'fake-jwt-token-admin');
        localStorage.setItem('role', 'admin');
        navigate('/admin/tables');
      } else {
        throw new Error('Tài khoản hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔥</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
            Smart Restaurant
          </h1>
          <p style={{ color: '#95a5a6', fontSize: '14px' }}>
            Quản trị viên & Nhân viên
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="form-hint error" style={{ textAlign: 'center', marginBottom: '15px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;