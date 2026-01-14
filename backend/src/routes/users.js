/**
 * Users Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// GET /api/users/profile - Get profile
router.get('/profile', requireAuth, usersController.getProfile);

// PUT /api/users/profile - Update profile with avatar
router.put('/profile', requireAuth, upload.single('avatar'), usersController.updateProfile);

// PUT /api/users/change-password - Change password
router.put('/change-password', requireAuth, usersController.changePassword);

// GET /api/users/history - Order history
router.get('/history', requireAuth, usersController.getHistory);

// GET /api/users/admins - List admins (admin only)
router.get('/admins', requireAuth, requireRole('admin'), usersController.listAdmins);

module.exports = router;