const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      token: token,
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

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const check = await db.query("SELECT 1 FROM users WHERE email = $1", [
      email,
    ]);
    if (check.rowCount > 0)
      return res.status(400).json({ message: "Email is already in use" });

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, role, status) 
       VALUES ($1, $2, 'guest', 'active') RETURNING id, email, role`,
      [email, hash]
    );

    res.status(201).json({ message: "Registration successful", user: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ============ GOOGLE OAUTH ============
router.post("/google", async (req, res, next) => {
  try {
    const { idToken } = req.body; // Token từ Frontend (Login with Google button)

    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required" });
    }

    // 1. Verify Token với Google
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // 2. Check xem user có chưa trong bảng users (staff)
    let { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    let user = rows[0];

    if (!user) {
      // 3a. Nếu chưa có -> Tự động đăng ký (Status active vì Google đã verify email)
      const newUser = await db.query(
        `INSERT INTO users (email, password_hash, role, status)
         VALUES ($1, '', 'guest', 'active')
         RETURNING *`,
        [email]
      );
      user = newUser.rows[0];
    }

    // 4. Cấp Token JWT của hệ thống
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Google Login successful",
      token: accessToken,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: name || user.email,
        avatar: picture,
      },
    });
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    res.status(401).json({ message: "Google authentication failed" });
  }
});

// ============ GOOGLE OAUTH FOR CUSTOMERS ============
router.post("/customer/google", async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required" });
    }

    // 1. Verify Token với Google
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // 2. Check xem customer có chưa
    let { rows } = await db.query("SELECT * FROM customers WHERE email = $1", [email]);
    let customer = rows[0];

    if (!customer) {
      // 3a. Nếu chưa có -> Tự động đăng ký
      const newCustomer = await db.query(
        `INSERT INTO customers (email, full_name, password_hash, type)
         VALUES ($1, $2, '', 'member')
         RETURNING *`,
        [email, name]
      );
      customer = newCustomer.rows[0];
    }

    // 4. Cấp Token JWT
    const accessToken = jwt.sign(
      { customerId: customer.id, email: customer.email, type: "customer" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google Login successful",
      token: accessToken,
      accessToken,
      customer: {
        id: customer.id,
        email: customer.email,
        fullName: name || customer.full_name,
        phone: customer.phone,
        avatar: picture,
        tier: customer.tier,
        totalPoints: customer.total_points,
      },
    });
  } catch (err) {
    console.error("Google Auth Error (Customer):", err.message);
    res.status(401).json({ message: "Google authentication failed" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = rows[0];

    // Luôn trả về thành công để tránh lộ email (Security Best Practice)
    if (!user) {
      return res.json({
        message: "If the email exists, a reset link will be sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expireTime = new Date(Date.now() + 3600000); // 1 giờ

    await db.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
      [resetTokenHash, expireTime, user.id]
    );

    const resetUrl = `${process.env.CLIENT_BASE_URL}/admin/reset-password?token=${resetToken}`;
    const message = `Bạn đã yêu cầu đặt lại mật khẩu.\n\nVui lòng click vào link bên dưới để đặt lại mật khẩu:\n${resetUrl}\n\nLink này có hiệu lực trong 1 giờ.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`;

    await sendEmail(user.email, "Đặt lại mật khẩu - Smart Restaurant", message);

    // Mẹo dev: Log token ra console để test dễ hơn
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV ONLY] Reset Token for ${email}: ${resetToken}`);
    }

    res.json({ message: "Reset email sent!" });
  } catch (err) {
    next(err);
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const { rows } = await db.query(
      `SELECT * FROM users 
       WHERE reset_password_token = $1 
       AND reset_password_expires > NOW()`,
      [resetTokenHash]
    );

    const user = rows[0];
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const newPassHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users 
       SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL 
       WHERE id = $2`,
      [newPassHash, user.id]
    );

    res.json({ message: "Password reset successful! Please login." });
  } catch (err) {
    next(err);
  }
});

// ==================== CUSTOMER AUTH ====================

// CUSTOMER FORGOT PASSWORD
router.post("/customer/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    const { rows } = await db.query(
      "SELECT * FROM customers WHERE email = $1",
      [email]
    );
    const customer = rows[0];

    // Luôn trả về thành công để tránh lộ email
    if (!customer) {
      return res.json({
        message: "Nếu email tồn tại, link đặt lại mật khẩu sẽ được gửi.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expireTime = new Date(Date.now() + 3600000); // 1 giờ

    await db.query(
      "UPDATE customers SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
      [resetTokenHash, expireTime, customer.id]
    );

    const resetUrl = `${
      process.env.CLIENT_BASE_URL || "http://192.168.1.3:3000"
    }/guest/reset-password?token=${resetToken}`;
    const message = `Xin chào ${
      customer.full_name || "Quý khách"
    },\n\nBạn đã yêu cầu đặt lại mật khẩu.\n\nVui lòng click vào link bên dưới để đặt lại mật khẩu:\n${resetUrl}\n\nLink này có hiệu lực trong 1 giờ.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\nTrân trọng,\nSmart Restaurant`;

    try {
      await sendEmail(
        customer.email,
        "Đặt lại mật khẩu - Smart Restaurant",
        message
      );
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr);
    }

    // Dev mode: Log token
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Customer Reset Token for ${email}: ${resetToken}`);
    }

    res.json({
      message: "Nếu email tồn tại, link đặt lại mật khẩu sẽ được gửi.",
    });
  } catch (err) {
    next(err);
  }
});

// CUSTOMER RESET PASSWORD
router.post("/customer/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token và mật khẩu mới là bắt buộc" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const { rows } = await db.query(
      `SELECT * FROM customers 
       WHERE reset_password_token = $1 
       AND reset_password_expires > NOW()`,
      [resetTokenHash]
    );

    const customer = rows[0];
    if (!customer) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const newPassHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE customers 
       SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW()
       WHERE id = $2`,
      [newPassHash, customer.id]
    );

    res.json({ message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập." });
  } catch (err) {
    next(err);
  }
});

// Token Verification Endpoint
router.get("/verify", async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    // Check if user still exists and is active
    const result = await db.query(
      "SELECT id, email, role, status FROM users WHERE id = $1",
      [decoded.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    next(err);
  }
});

// STAFF/ADMIN CHANGE PASSWORD
router.put("/change-password", async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Không có token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const userId = decoded.userId;

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    // Get current password hash
    const { rows } = await db.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      rows[0].password_hash
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newPasswordHash,
      userId,
    ]);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    next(err);
  }
});

module.exports = router;
