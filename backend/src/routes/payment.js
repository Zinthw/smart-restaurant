const express = require('express');
const db = require('../db');
const { getIO } = require('../socket');
const router = express.Router();

// GET /api/payment/tables/:tableId/bill
router.get('/tables/:tableId/bill', async (req, res, next) => {
  try {
    const { tableId } = req.params;

    const orderRes = await db.query(`
        SELECT * FROM orders 
        WHERE table_id = $1 AND status NOT IN ('paid', 'cancelled')
    `, [tableId]);

    if (orderRes.rowCount === 0) return res.status(404).json({ message: 'No unpaid orders found' });

    const orderIds = orderRes.rows.map(o => o.id);
    const itemsRes = await db.query(`
        SELECT oi.*, m.name 
        FROM order_items oi
        JOIN menu_items m ON oi.menu_item_id = m.id
        WHERE oi.order_id = ANY($1::uuid[])
    `, [orderIds]);

    const items = itemsRes.rows;
    
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const tax = subtotal * 0.10; // VAT 10%
    const total = subtotal + tax;

    res.json({
        tableId,
        orders: orderRes.rows,
        items,
        summary: {
            subtotal,
            tax,
            total
        }
    });
  } catch (err) { next(err); }
});

// POST /api/payment/orders/:id/pay
router.post('/orders/:id/pay', async (req, res, next) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { method } = req.body; // 'cash', 'momo', 'zalopay', 'stripe'

        // Lấy thông tin order
        const orderRes = await client.query(
            "SELECT * FROM orders WHERE id = $1 AND status != 'paid'",
            [id]
        );
        
        if (orderRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Order not found or already paid' });
        }

        const order = orderRes.rows[0];

        // Tính điểm thưởng: 1 điểm / 10.000 VND
        const pointsEarned = Math.floor(parseFloat(order.total_amount) / 10000);

        // Update Order Status -> paid
        const updateRes = await client.query(
            `UPDATE orders 
             SET status = 'paid', paid_at = NOW(), points_earned = $1 
             WHERE id = $2 
             RETURNING *`,
            [pointsEarned, id]
        );
        
        const updatedOrder = updateRes.rows[0];
        let customerInfo = null;

        // Nếu order có customer_id thì cộng điểm và cập nhật tier
        if (order.customer_id) {
            // Cộng điểm vào customer
            const customerRes = await client.query(
                `UPDATE customers 
                 SET total_points = total_points + $1, updated_at = NOW()
                 WHERE id = $2
                 RETURNING id, full_name, total_points, tier`,
                [pointsEarned, order.customer_id]
            );

            if (customerRes.rowCount > 0) {
                const customer = customerRes.rows[0];
                
                // Cập nhật tier dựa trên tổng điểm
                let newTier = 'bronze';
                if (customer.total_points >= 1000) newTier = 'platinum';
                else if (customer.total_points >= 500) newTier = 'gold';
                else if (customer.total_points >= 200) newTier = 'silver';

                if (newTier !== customer.tier) {
                    await client.query(
                        "UPDATE customers SET tier = $1 WHERE id = $2",
                        [newTier, order.customer_id]
                    );
                    customer.tier = newTier;
                }

                customerInfo = {
                    id: customer.id,
                    name: customer.full_name,
                    pointsEarned,
                    totalPoints: customer.total_points,
                    tier: customer.tier
                };
            }
        }

        await client.query('COMMIT');

        // Socket: Báo cho mọi người biết bàn này đã xong
        try {
            const io = getIO();
            io.to(`table:${order.table_id}`).emit('order:paid', updatedOrder);
            io.to('role:waiter').emit('order:paid', updatedOrder);
        } catch (e) {}

        res.json({ 
            message: 'Payment successful', 
            order: updatedOrder,
            loyalty: customerInfo
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
});

// GET /api/payment/orders/:id/receipt
router.get('/orders/:id/receipt', async (req, res, next) => {
    try {
        const { id } = req.params;
        const orderRes = await db.query("SELECT * FROM orders WHERE id = $1 AND status = 'paid'", [id]);
        
        if (orderRes.rowCount === 0) return res.status(404).json({ message: 'Receipt not found or not paid yet' });
        const order = orderRes.rows[0];

        const itemsRes = await db.query(`
            SELECT oi.*, m.name 
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE oi.order_id = $1
        `, [id]);

        res.json({
            restaurant: "Smart Restaurant",
            address: "123 Food Street",
            orderId: order.id,
            date: order.paid_at,
            items: itemsRes.rows,
            total: order.total_amount
        });
    } catch (err) { next(err); }
});

module.exports = router;