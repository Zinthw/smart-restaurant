/**
 * Kitchen Controller
 * Handles all kitchen-related (KDS) business logic
 */

const db = require("../db");
const { getIO } = require("../socket");

/**
 * GET /api/kitchen/orders
 * Get all active orders for kitchen display
 */
exports.getOrders = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT o.id as order_id, o.table_id, t.table_number, o.status as order_status, o.created_at,
             o.customer_name,
             json_agg(
               json_build_object(
                 'id', oi.id, 
                 'name', m.name, 
                 'quantity', oi.quantity, 
                 'modifiers', oi.modifiers_selected,
                 'notes', oi.notes,
                 'status', oi.status
               )
             ) FILTER (WHERE oi.status IN ('pending', 'preparing', 'ready')) as items
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE o.status NOT IN ('paid', 'cancelled')
        AND oi.status IN ('pending', 'preparing', 'ready')
      GROUP BY o.id, t.table_number
      HAVING COUNT(oi.id) FILTER (WHERE oi.status IN ('pending', 'preparing', 'ready')) > 0
      ORDER BY o.created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/kitchen/items/:itemId/status
 * Update item status (preparing/ready)
 */
exports.updateItemStatus = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body; // 'preparing' hoặc 'ready'

    if (!["preparing", "ready"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const { rows } = await db.query(
      "UPDATE order_items SET status = $1 WHERE id = $2 RETURNING *",
      [status, itemId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Item not found" });
    const item = rows[0];

    // Socket: Báo cho Waiter biết món này đã xong
    if (status === "ready") {
      const io = getIO();
      io.to("role:waiter").emit("item:ready", {
        orderId: item.order_id,
        itemId: item.id,
      });
    }

    res.json({ message: `Item updated to ${status}`, item });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/kitchen/orders/:id/preparing
 * Mark order as preparing
 */
exports.startPreparing = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Update order status
    const { rows } = await db.query(
      "UPDATE orders SET status = 'preparing', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Order not found" });

    // Update all order items to preparing
    await db.query(
      "UPDATE order_items SET status = 'preparing' WHERE order_id = $1",
      [id]
    );

    // Socket: Báo cho Waiter và Khách
    const io = getIO();
    io.to("role:waiter").emit("order:update", rows[0]);
    io.to(`table:${rows[0].table_id}`).emit("order:update", {
      status: "preparing",
    });

    res.json({ message: "Order is now preparing", order: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/kitchen/orders/:id/ready
 * Mark order as ready to serve
 */
exports.markReady = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      "UPDATE orders SET status = 'ready', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Order not found" });

    // Socket: Báo Waiter ra bưng món, Báo Khách biết
    const io = getIO();
    io.to("role:waiter").emit("order:ready", rows[0]);
    io.to(`table:${rows[0].table_id}`).emit("order:update", {
      status: "ready",
    });

    res.json({ message: "Order is ready to serve", order: rows[0] });
  } catch (err) {
    next(err);
  }
};
