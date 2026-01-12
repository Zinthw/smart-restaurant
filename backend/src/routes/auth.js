const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. REGISTER STAFF (ADMIN ONLY)
router.post("/register", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { email, password, role, full_name, phone } = req.body;

    // Validate Input
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    // Chặn đăng ký Admin qua API này
    if (role === "admin") {
      return res.status(403).json({
        message: "Registration for admin role is restricted.",
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
    const userCheck = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (userCheck.rowCount > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert DB (Staff mặc định active, không cần verify email)
    const newUser = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status, auth_provider) 
       VALUES ($1, $2, $3, $4, $5, 'active', 'local') 
       RETURNING id, email, full_name, role, status, created_at`,
      [email, passwordHash, full_name, phone, role]
    );

    res.status(201).json({
      message: "Staff user created successfully",
      user: newUser.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// 2. LOGIN (UNIVERSAL: ADMIN, STAFF, GUEST)
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    // Check password
    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check status
    if (user.status === "inactive") {
      return res.status(403).json({ message: "Please verify your email first!" });
    }
    if (user.status === "banned") {
      return res.status(403).json({ message: "Account is banned" });
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
        full_name: user.full_name,
        avatar: user.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 3. GUEST REGISTER (SELF-SERVICE)
router.post("/guest/register", async (req, res, next) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // Check exist
    const check = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (check.rowCount > 0)
      return res.status(400).json({ message: "Email is already in use" });

    const hash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // Insert user với status 'inactive' và role 'guest'
    await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status, auth_provider, verification_token) 
       VALUES ($1, $2, $3, $4, 'guest', 'inactive', 'local', $5)`,
      [email, hash, full_name, phone, verifyToken]
    );

    // Gửi email xác thực
    const verifyUrl = `${process.env.CLIENT_BASE_URL}/verify-email?token=${verifyToken}`;
    const message = `Welcome to Smart Restaurant!\n\nPlease click here to verify your email:\n${verifyUrl}`;
    
    await sendEmail(email, "Verify Your Email", message);

    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV ONLY] Verify Token for ${email}: ${verifyToken}`);
    }

    res.status(201).json({ message: "Registration successful! Please check your email to verify account." });
  } catch (err) {
    next(err);
  }
});

// 5. GOOGLE OAUTH (UNIVERSAL)
router.post("/google", async (req, res, next) => {
  try {
    const { idToken } = req.body; 
    if (!idToken) return res.status(400).json({ message: "Google ID token is required" });

    // 1. Verify Token với Google
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // 2. Check user trong bảng USERS
    let { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    let user = rows[0];

    if (!user) {
      // 3a. Chưa có -> Tạo mới (Role guest, Status active)
      const newUser = await db.query(
        `INSERT INTO users (email, full_name, avatar_url, role, status, auth_provider, google_id)
         VALUES ($1, $2, $3, 'guest', 'active', 'google', $4)
         RETURNING *`,
        [email, name, picture, googleId]
      );
      user = newUser.rows[0];
    } else {
      // 3b. Đã có -> Update google_id nếu chưa link
      await db.query(
          `UPDATE users 
           SET auth_provider = 'google', 
               google_id = $1, 
               avatar_url = $2, 
               full_name = $3,
               status = CASE WHEN status = 'inactive' THEN 'active' ELSE status END
           WHERE id = $4`, 
          [googleId, picture, name, user.id]
      );
      
      const updatedUser = await db.query("SELECT * FROM users WHERE id = $1", [user.id]);
      user = updatedUser.rows[0];
    }

    if (user.status === 'banned') {
        return res.status(403).json({ message: "Account is banned" });
    }

    // 4. Cấp Token JWT
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Google Login successful",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        avatar: user.avatar_url, // Map đúng cột avatar_url trong DB
      },
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ message: "Google auth failed: " + err.message });
  }
});

// 6. FORGOT PASSWORD
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];

    if (!user) {
      return res.json({ message: "If the email exists, a reset link will be sent." });
    }
    
    if (user.auth_provider === 'google') {
         return res.status(400).json({ message: "Please login with Google." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expireTime = new Date(Date.now() + 3600000); // 1 giờ

    await db.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
      [resetTokenHash, expireTime, user.id]
    );

    const resetUrl = `${process.env.CLIENT_BASE_URL}/reset-password?token=${resetToken}`;
    const message = `You have requested to reset your password.\n\nPlease click the link below:\n${resetUrl}\n\nThis link expires in 1 hour.`;

    await sendEmail(user.email, "Password Reset - Smart Restaurant", message);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV ONLY] Reset Token for ${email}: ${resetToken}`);
    }

    res.json({ message: "Reset email sent!" });
  } catch (err) {
    next(err);
  }
});

// 7. RESET PASSWORD
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) return res.status(400).json({ message: "Invalid request" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

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
  } catch (err) {
    next(err);
  }
});

// 8. VERIFY TOKEN (GET /me)
router.get("/verify", async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const result = await db.query(
      "SELECT id, email, full_name, role, status, avatar_url FROM users WHERE id = $1",
      [decoded.userId]
    );
    const user = result.rows[0];

    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.status !== "active") return res.status(403).json({ message: "Account is inactive" });

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        avatar: user.avatar_url,
      },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    next(err);
  }
});

// 9. CHANGE PASSWORD (LOGGED IN)
router.put("/change-password", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware requireAuth
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const { rows } = await db.query("SELECT password_hash, auth_provider FROM users WHERE id = $1", [userId]);
    const user = rows[0];

    if (!user) return res.status(404).json({ message: "User not found" });

    // Nếu user login bằng Google thì không có password để check
    if (user.auth_provider === 'google') {
        return res.status(400).json({ message: "Google account cannot change password here." });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) return res.status(401).json({ message: "Incorrect current password" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
