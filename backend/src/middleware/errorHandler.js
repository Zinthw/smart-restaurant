function errorHandler(err, req, res, next) {
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err);
  } else {
    // In production, log error without exposing details
    console.error('Error occurred:', {
      message: err.message,
      code: err.code,
      path: req.path,
      method: req.method
    });
  }

  const status = err.status || err.statusCode || 500;
  
  // Don't expose internal error details in production
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Đã xảy ra lỗi, vui lòng thử lại sau'
    : err.message || 'Lỗi hệ thống';

  res.status(status).json({
    error: err.code || 'ERROR',
    message: message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

module.exports = errorHandler;

