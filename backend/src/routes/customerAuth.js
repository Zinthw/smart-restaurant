const express = require("express");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// POST /api/auth/customer/register
router.post("/register", async (req, res, next) => {
  try {
    const { fullName, phone, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check email/phone đã tồn tại chưa
    const check = await db.query(
      "SELECT 1 FROM customers WHERE email = $1 OR phone = $2",
      [email, phone || null]
    );
    if (check.rowCount > 0) {
      return res.status(400).json({ message: "Email or phone already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      `INSERT INTO customers (full_name, phone, email, password_hash, type, total_points, tier) 
       VALUES ($1, $2, $3, $4, 'member', 0, 'bronze') 
       RETURNING id, full_name, phone, email, type, total_points, tier, created_at`,
      [fullName || null, phone || null, email, hash]
    );

    res.status(201).json({ 
      message: "Registration successful", 
      customer: rows[0] 
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/customer/login
router.post("/login", async (req, res, next) => {
  try {
    const { phoneOrEmail, password } = req.body;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({ message: "Phone/Email and password are required" });
    }

    // Tìm customer theo phone hoặc email
    const { rows } = await db.query(
      `SELECT * FROM customers 
       WHERE (email = $1 OR phone = $1) AND type = 'member'`,
      [phoneOrEmail]
    );

    const customer = rows[0];
    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Tạo JWT riêng cho customer
    const token = jwt.sign(
      { customerId: customer.id, type: "customer" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token: token,
      accessToken: token,
      customer: {
        id: customer.id,
        fullName: customer.full_name,
        phone: customer.phone,
        email: customer.email,
        tier: customer.tier,
        totalPoints: customer.total_points
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
