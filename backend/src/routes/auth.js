/**
 * Auth Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

// POST /api/auth/register - Register staff (Admin only)
router.post("/register", requireAuth, requireRole("admin"), authController.registerStaff);

// POST /api/auth/login - Universal login
router.post("/login", authController.login);

// POST /api/auth/guest/register - Guest self-registration
router.post("/guest/register", authController.guestRegister);

// GET /api/auth/verify-email - Verify email with token
router.get("/verify-email", authController.verifyEmail);

// POST /api/auth/google - Google OAuth login
router.post("/google", authController.googleAuth);

// POST /api/auth/forgot-password - Request password reset
router.post("/forgot-password", authController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post("/reset-password", authController.resetPassword);

// GET /api/auth/verify - Verify JWT token
router.get("/verify", authController.verifyToken);

// PUT /api/auth/change-password - Change password (logged in)
router.put("/change-password", requireAuth, authController.changePassword);

module.exports = router;
