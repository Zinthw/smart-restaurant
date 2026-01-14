/**
 * Customer Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const customerController = require("../controllers/customer.controller");
const upload = require("../middleware/uploadMiddleware");

// Middleware verify token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    
    // Check active
    const { rows } = await db.query("SELECT id, status FROM users WHERE id = $1", [decoded.userId]);
    if (!rows[0] || rows[0].status !== 'active') {
        return res.status(403).json({ message: "User invalid" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Apply token verification to all routes
router.use(verifyToken);

// GET /api/customer/profile - Get profile
router.get("/profile", customerController.getProfile);

// PUT /api/customer/profile - Update profile with avatar
router.put("/profile", upload.single('avatar'), customerController.updateProfile);

// GET /api/customer/orders - Get order history
router.get("/orders", customerController.getOrders);

// GET /api/customer/points - Get loyalty points
router.get("/points", customerController.getPoints);

// GET /api/customer/ordered-items - Get list of items customer has ordered
router.get("/ordered-items", customerController.getOrderedItems);

// PUT /api/customer/change-password - Change password
router.put("/change-password", customerController.changePassword);

module.exports = router;