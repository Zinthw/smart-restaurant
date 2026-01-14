/**
 * Waiter Controller
 * Handles all waiter-related business logic
 */

const db = require("../db");
const { getIO } = require("../socket");

/**
 * GET /api/waiter/orders
 * Get orders for waiter with optional status filter
 */
exports.getOrders = async (req, res, next) => {
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
      query += ` WHERE o.status NOT IN ('cancelled')`;
    }

    query += ` ORDER BY o.created_at DESC`;
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
};

/**
 * PATCH /api/waiter/orders/:id/accept
 * Accept a pending order
 */
exports.acceptOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await db.query("SELECT status, table_id FROM orders WHERE id = $1", [id]);
    if (check.rowCount === 0) return res.status(404).json({ message: 'Order not found' });
    if (check.rows[0].status !== 'pending') {
        return res.status(400).json({ message: 'Can only accept pending orders' });
    }

    const { rows } = await db.query(
      "UPDATE orders SET status = 'accepted', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    // Socket: Bắn tin cho Bếp (Kitchen) và Khách
    const io = getIO();
    io.to('role:kitchen').emit('order:new_task', rows[0]); 
    io.to(`table:${check.rows[0].table_id}`).emit('order:update', { status: 'accepted' }); 

    res.json({ message: 'Order accepted', order: rows[0] });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/waiter/orders/:id/reject
 * Reject/cancel an order
 */
exports.rejectOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Order not found' });

    // Socket: Báo khách bị hủy
    const io = getIO();
    io.to(`table:${rows[0].table_id}`).emit('order:update', { status: 'cancelled' });

    res.json({ message: 'Order cancelled', order: rows[0] });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/waiter/orders/:id/served
 * Mark order as served
 */
exports.serveOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      "UPDATE orders SET status = 'served', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Order not found' });

    // Socket: Báo khách "Chúc ngon miệng"
    const io = getIO();
    io.to(`table:${rows[0].table_id}`).emit('order:update', { status: 'served' });
    
    res.json({ message: 'Order served', order: rows[0] });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/waiter/items/:itemId/served
 * Mark item as served
 */
exports.serveItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { rows } = await db.query(
      "UPDATE order_items SET status = 'served' WHERE id = $1 RETURNING *",
      [itemId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Item not found" });

    const item = rows[0];

    // Socket: Báo khách món đã phục vụ
    const io = getIO();
    const orderRes = await db.query("SELECT table_id FROM orders WHERE id = $1", [item.order_id]);
    if (orderRes.rowCount > 0) {
      io.to(`table:${orderRes.rows[0].table_id}`).emit('item:served', {
        orderId: item.order_id,
        itemId: item.id,
      });
    }

    res.json({ message: `Item marked as served`, item });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/waiter/items/ready
 * Get all items that are ready to serve (status='ready')
 */
exports.getReadyItems = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT oi.id as item_id, oi.quantity, oi.status, oi.notes,
             mi.name as item_name,
             o.id as order_id, t.table_number,
             oi.modifiers_selected
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN tables t ON o.table_id = t.id
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.status = 'ready' 
        AND o.status NOT IN ('paid', 'cancelled')
      ORDER BY oi.created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
