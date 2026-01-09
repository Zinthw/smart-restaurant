const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Login validation
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  validate
];

// Registration validation
const validateRegister = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên phải từ 2-100 ký tự'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  validate
];

// Order validation
const validateOrder = [
  body('table_id')
    .notEmpty()
    .withMessage('Thiếu mã bàn')
    .isUUID()
    .withMessage('Mã bàn không hợp lệ'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Đơn hàng phải có ít nhất 1 món'),
  body('items.*.menu_item_id')
    .isUUID()
    .withMessage('Mã món ăn không hợp lệ'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Số lượng phải từ 1-99'),
  validate
];

// Review validation
const validateReview = [
  body('item_id')
    .notEmpty()
    .withMessage('Thiếu mã món ăn')
    .isUUID()
    .withMessage('Mã món ăn không hợp lệ'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Đánh giá phải từ 1-5 sao'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Nhận xét không được để trống')
    .isLength({ min: 10, max: 500 })
    .withMessage('Nhận xét phải từ 10-500 ký tự'),
  validate
];

module.exports = {
  validateLogin,
  validateRegister,
  validateOrder,
  validateReview
};
