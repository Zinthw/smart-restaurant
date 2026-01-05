const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/admin/reports/daily?from=2023-01-01&to=2023-01-31
router.get('/daily', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = `
        SELECT 
            DATE(paid_at) as date, 
            COUNT(*) as total_orders, 
            SUM(total_amount) as revenue
        FROM orders
        WHERE status = 'paid'
        ${from && to ? "AND paid_at BETWEEN $1 AND $2" : ""}
        GROUP BY DATE(paid_at)
        ORDER BY date DESC
    `;
    
    const params = from && to ? [from, to] : [];
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/admin/reports/top-items
router.get('/top-items', async (req, res, next) => {
    try {
        const { rows } = await db.query(`
            SELECT m.name, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as revenue
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'paid'
            GROUP BY m.id, m.name
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (err) { next(err); }
});

// GET /api/admin/reports/summary
router.get('/summary', async (req, res, next) => {
    try {
        const todayRes = await db.query(`
            SELECT COUNT(*) as orders_today, COALESCE(SUM(total_amount), 0) as revenue_today 
            FROM orders WHERE status = 'paid' AND DATE(paid_at) = CURRENT_DATE
        `);
        
        const activeRes = await db.query(`
            SELECT COUNT(*) as active_orders FROM orders WHERE status IN ('pending', 'accepted', 'preparing', 'ready')
        `);

        res.json({
            today: todayRes.rows[0],
            active: activeRes.rows[0]
        });
    } catch (err) { next(err); }
});

module.exports = router;