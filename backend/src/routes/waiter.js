const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/waiter/orders?status=pending
router.get('/orders', async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT o.*, t.table_number 
      FROM orders o
      JOIN tables t ON o.table_id = t.id
    `;
    const params = [];

    if (status) {
      query += ` WHERE o.status = $1`;
      params.push(status);
    } else {
      query += ` WHERE o.status NOT IN ('cancelled', 'paid')`;
    }

    query += ` ORDER BY o.created_at ASC`;

    const { rows } = await db.query(query, params);

    const ordersWithItems = await Promise.all(rows.map(async (order) => {
      const itemsRes = await db.query(`
        SELECT oi.*, mi.name as item_name 
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = $1
      `, [order.id]);
      return { ...order, items: itemsRes.rows };
    }));

    res.json(ordersWithItems);
  } catch (err) { next(err); }
});

// PATCH /api/waiter/orders/:id/accept
router.patch('/orders/:id/accept', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const check = await db.query("SELECT status FROM orders WHERE id = $1", [id]);
    if (check.rowCount === 0) return res.status(404).json({ message: 'Order not found' });
    if (check.rows[0].status !== 'pending') {
        return res.status(400).json({ message: 'Can only accept pending orders' });
    }

    const { rows } = await db.query(
      "UPDATE orders SET status = 'accepted', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    res.json({ message: 'Order accepted', order: rows[0] });
  } catch (err) { next(err); }
});

// PATCH /api/waiter/orders/:id/reject
router.patch('/orders/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    // Logic: Có thể reject khi pending hoặc accepted (trường hợp khách hủy gấp)
    const { rows } = await db.query(
      "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order cancelled', order: rows[0] });
  } catch (err) { next(err); }
});

// PATCH /api/waiter/orders/:id/served
router.patch('/orders/:id/served', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      "UPDATE orders SET status = 'served', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order served', order: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;