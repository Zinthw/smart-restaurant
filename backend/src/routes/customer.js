const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/customer/profile
router.get("/profile", async (req, res, next) => {
  try {
    const customerId = req.customer.customerId;

    const { rows } = await db.query(
      `SELECT id, full_name, phone, email, type, total_points, tier, created_at, updated_at 
       FROM customers WHERE id = $1`,
      [customerId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/customer/profile
router.put("/profile", async (req, res, next) => {
  try {
    const customerId = req.customer.customerId;
    const { fullName, phone } = req.body;

    const { rows } = await db.query(
      `UPDATE customers 
       SET full_name = COALESCE($1, full_name), 
           phone = COALESCE($2, phone),
           updated_at = NOW()
       WHERE id = $3 
       RETURNING id, full_name, phone, email, total_points, tier`,
      [fullName, phone, customerId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Profile updated", customer: rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/customer/orders
router.get("/orders", async (req, res, next) => {
  try {
    const customerId = req.customer.customerId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { rows } = await db.query(
      `SELECT o.*, t.table_number,
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'name', m.name,
                  'quantity', oi.quantity,
                  'price', oi.total_price
                )
              ) as items
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items m ON oi.menu_item_id = m.id
       WHERE o.customer_id = $1
       GROUP BY o.id, t.table_number
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [customerId, limit, offset]
    );

    const countRes = await db.query(
      "SELECT COUNT(*) FROM orders WHERE customer_id = $1",
      [customerId]
    );

    res.json({
      data: rows,
      pagination: {
        total: parseInt(countRes.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/customer/points
router.get("/points", async (req, res, next) => {
  try {
    const customerId = req.customer.customerId;

    const { rows } = await db.query(
      `SELECT total_points, tier FROM customers WHERE id = $1`,
      [customerId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Tính tier tiếp theo và điểm cần thiết
    const points = rows[0].total_points;
    const tier = rows[0].tier;
    let nextTier = null;
    let pointsToNext = 0;

    const tierThresholds = {
      bronze: { next: "silver", threshold: 200 },
      silver: { next: "gold", threshold: 500 },
      gold: { next: "platinum", threshold: 1000 },
      platinum: { next: null, threshold: null }
    };

    if (tierThresholds[tier].next) {
      nextTier = tierThresholds[tier].next;
      pointsToNext = tierThresholds[tier].threshold - points;
    }

    res.json({
      totalPoints: points,
      currentTier: tier,
      nextTier,
      pointsToNextTier: pointsToNext > 0 ? pointsToNext : 0
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
