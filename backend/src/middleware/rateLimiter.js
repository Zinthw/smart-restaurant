const rateLimit = require('express-rate-limit');

// General API rate limiter - 100 requests per 15 SECONDS (for testing)
const apiLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds (was 15 minutes)
  max: 100,
  message: {
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 giây.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints - 5 requests per 15 SECONDS (for testing)
const authLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds (was 15 minutes)
  max: 5,
  message: {
    message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 giây.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Moderate limiter for order creation - 20 requests per 15 SECONDS (for testing)
const orderLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds (was 15 minutes)
  max: 20,
  message: {
    message: 'Quá nhiều đơn hàng được tạo, vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  orderLimiter
};
