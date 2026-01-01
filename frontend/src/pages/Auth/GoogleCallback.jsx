import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Save token to localStorage
      localStorage.setItem('customerToken', token);
      
      // Fetch customer info using the token
      fetch('http://localhost:3000/auth/customer/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.customer) {
            localStorage.setItem('customerInfo', JSON.stringify(data.customer));
            toast.success(`Chào mừng ${data.customer.fullName}!`);
            navigate('/menu/guest');
          } else {
            throw new Error('Invalid response');
          }
        })
        .catch(err => {
          console.error('Error fetching profile:', err);
          toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
          navigate('/login');
        });
    } else {
      toast.error('Xác thực Google thất bại');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ 
        width: '50px', 
        height: '50px', 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #e74c3c',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: '#7f8c8d', fontSize: '16px' }}>Đang xác thực với Google...</p>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
