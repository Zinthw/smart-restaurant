const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  // Check token from header first, then query string (for downloads)
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // If no token in header, check query string
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required (Missing Token)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const allowedRoles = Array.isArray(role) ? role : [role];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};

// Middleware cho Customer (yêu cầu đăng nhập)
const requireCustomer = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Customer authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.type !== 'customer') {
      return res.status(403).json({ message: 'Customer access only' });
    }
    req.customer = decoded; // { customerId, type: 'customer' }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware optional - không bắt buộc login nhưng nếu có token thì attach customer
const optionalCustomer = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      if (decoded.type === 'customer') {
        req.customer = decoded;
      }
    } catch (err) {
      // Token không hợp lệ - bỏ qua, tiếp tục như guest
    }
  }
  next();
};

module.exports = { requireAuth, requireRole, requireCustomer, optionalCustomer };