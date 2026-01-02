const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); 

const router = express.Router();

// Register new staff (Roles: staff, waiter, kitchen)
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validate Input
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
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Allowed roles: staff, waiter, kitchen",
      });
    }

    // Check Email exists
    const userCheck = await db.query("SELECT 1 FROM users WHERE email = $1", [
      email,
    ]);
    if (userCheck.rowCount > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash Password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert DB
    const newUser = await db.query(
      `INSERT INTO users (email, password_hash, role, status) 
       VALUES ($1, $2, $3, 'active') 
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

// Login (For all roles including Admin)
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    // Check password
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check status
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is inactive" });
    }

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
      },
    });
  } catch (err) {
    next(err);
  }
});

// GUEST REGISTER 
router.post("/guest/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const check = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (check.rowCount > 0) return res.status(400).json({ message: "Email is already in use" });

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, role, status) 
       VALUES ($1, $2, 'guest', 'active') RETURNING id, email, role`,
      [email, hash]
    );

    res.status(201).json({ message: "Registration successful", user: rows[0] });
  } catch (err) { next(err); }
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

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expireTime = new Date(Date.now() + 3600000); // 1 giờ

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
