const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); 
const { OAuth2Client } = require('google-auth-library');
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register new staff (Roles: staff, waiter, kitchen)
router.post("/register", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required" });
    }
    // CHẶN ĐĂNG KÝ ADMIN
    if (role === "admin") {
      return res.status(403).json({
        message:
          "Registration for admin role is restricted. Please use the pre-configured admin account.",
      });
    }

    // Validate Role
    const validRoles = ["staff", "waiter", "kitchen"];
    if (!validRoles.includes(role)) { return res.status(400).json({ message: "Invalid role. Allowed roles: staff, waiter, kitchen",});}

    // Check Email exists
    const userCheck = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (userCheck.rowCount > 0) { return res.status(400).json({ message: "Email already exists" });}

    // Hash Password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert DB
    const newUser = await db.query(
      `INSERT INTO users (email, password_hash, role, status, auth_provider) 
       VALUES ($1, $2, $3, 'active', 'local') 
       RETURNING id, email, role, status, created_at`,
      [email, passwordHash, role]
    );

    res.status(201).json({
      message: "User created successfully",
      user: newUser.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// Login (Local)
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await db.query("SELECT * FROM users WHERE email = $1 AND auth_provider = 'local'", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ message: "Please verify your email first!" });
    }
    if (user.status === "banned") {
      return res.status(403).json({ message: "Account is banned" });
    }
    // if (user.status !== "active") {
    //   return res.status(403).json({ message: "Account is inactive" });
    // }

    // Generate Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.full_name
      },
    });
  } catch (err) {
    next(err);
  }
});

// GUEST REGISTER 
router.post("/guest/register", async (req, res, next) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const check = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (check.rowCount > 0) return res.status(400).json({ message: "Email is already in use" });

    const hash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // Insert user với status = 'inactive'
    await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status, auth_provider, verification_token) 
       VALUES ($1, $2, $3, $4, 'guest', 'inactive', 'local', $5)`,
      [email, hash, full_name, phone, verifyToken]
    );

    // Gửi email
    const verifyUrl = `${process.env.CLIENT_BASE_URL}/verify-email?token=${verifyToken}`;
    const message = `Welcome to Smart Restaurant!\n\nPlease click here to verify your email:\n${verifyUrl}`;
    
    await sendEmail(email, "Verify Your Email", message);

    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV ONLY] Verify Token for ${email}: ${verifyToken}`);
    }

    res.status(201).json({ message: "Registration successful! Please check your email to verify account." });
  } catch (err) { next(err); }
});

// VERIFY EMAIL API
router.post("/verify-email", async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token required" });

        const { rows } = await db.query(
            "SELECT * FROM users WHERE verification_token = $1", 
            [token]
        );

        if (rows.length === 0) return res.status(400).json({ message: "Invalid token" });

        await db.query(
            "UPDATE users SET status = 'active', verification_token = NULL WHERE id = $1",
            [rows[0].id]
        );

        res.json({ message: "Email verified successfully! You can now login." });
    } catch (err) { next(err); }
});

// 3. GOOGLE OAUTH
router.post("/google", async (req, res, next) => {
    try {
        const { idToken } = req.body; // Token từ Frontend gửi lên (Login with Google button)

        // 1. Verify Token với Google
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // 2. Check xem user có chưa
        let { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        let user = rows[0];

        if (!user) {
            // 3a. Nếu chưa -> Tự động đăng ký (Status active luôn vì Google đã verify email)
            const newUser = await db.query(
                `INSERT INTO users (email, full_name, avatar_url, role, status, auth_provider, google_id)
                 VALUES ($1, $2, $3, 'guest', 'active', 'google', $4)
                 RETURNING *`,
                [email, name, picture, googleId]
            );
            user = newUser.rows[0];
        } else {
            // 3b. Nếu có rồi -> Update google_id nếu chưa có
            if (user.auth_provider === 'local') {
                // Link account (Optional logic)
                await db.query("UPDATE users SET auth_provider = 'google', google_id = $1 WHERE id = $2", [googleId, user.id]);
            }
        }

        // 4. Cấp Token JWT của hệ thống mình
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        res.json({
            message: "Google Login successful",
            accessToken,
            user: { id: user.id, email: user.email, role: user.role, name: user.full_name, avatar: user.avatar_url }
        });

    } catch (err) {
        console.error("Google Auth Error:", err.message);
        res.status(401).json({ message: "Google authentication failed" });
    }
});

// FORGOT PASSWORD 
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];

    // Luôn trả về thành công để tránh lộ email (Security Best Practice)
    if (!user) {
      return res.json({ message: "If the email exists, a reset link will be sent." });
    }

    // Không cho reset pass nếu là tk Google
    if (user.auth_provider === 'google') {
        return res.status(400).json({ message: "Please login with Google." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expireTime = new Date(Date.now() + 3600000); 

    await db.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
      [resetTokenHash, expireTime, user.id]
    );

    const resetUrl = `${process.env.CLIENT_BASE_URL}/reset-password?token=${resetToken}`;
    const message = `You requested a password reset.\n\nPlease click the link below to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.`;

    await sendEmail(user.email, "Password Reset Request - Smart Restaurant", message);

    // Mẹo dev: Log token ra console để test dễ hơn
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV ONLY] Reset Token for ${email}: ${resetToken}`);
    }

    res.json({ message: "Reset email sent!" });
  } catch (err) { next(err); }
});

// RESET PASSWORD 
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const { rows } = await db.query(
      `SELECT * FROM users 
       WHERE reset_password_token = $1 
       AND reset_password_expires > NOW()`,
      [resetTokenHash]
    );

    const user = rows[0];
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const newPassHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users 
       SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL 
       WHERE id = $2`,
      [newPassHash, user.id]
    );

    res.json({ message: "Password reset successful! Please login." });
  } catch (err) { next(err); }
});

module.exports = router;
