const express = require('express');
const db = require('../db');
const { getIO } = require('../socket');
const router = express.Router();

// URL: POST /api/orders
router.post('/', async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { table_id, items, customer_name, notes } = req.body;

    if (!table_id || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing table_id or items' });
    }

    const tableRes = await db.query("SELECT id FROM tables WHERE id = $1", [table_id]);
    if (tableRes.rowCount === 0) return res.status(404).json({ message: 'Table not found' });
    const tableNumber = tableRes.rows[0].table_number;

    await client.query('BEGIN');

    let grandTotal = 0;
    const processedItems = [];

    for (const item of items) {
        const itemRes = await client.query("SELECT price, name FROM menu_items WHERE id = $1", [item.menu_item_id]);
        if (itemRes.rowCount === 0) throw new Error(`Item ${item.menu_item_id} not found`);
        
        const basePrice = parseFloat(itemRes.rows[0].price);
        let modifiersPrice = 0;

        if (item.modifiers && Array.isArray(item.modifiers)) {
            modifiersPrice = item.modifiers.reduce((sum, mod) => sum + parseFloat(mod.price || 0), 0);
        }

        const unitTotal = basePrice + modifiersPrice;
        const lineTotal = unitTotal * item.quantity;
        grandTotal += lineTotal;

        processedItems.push({
            ...item,
            name: itemRes.rows[0].name,
            price_per_unit: basePrice,
            total_price: lineTotal,
            modifiers_json: JSON.stringify(item.modifiers || [])
        });
    }

    const orderRes = await client.query(
        `INSERT INTO orders (table_id, customer_name, total_amount, notes, status) 
         VALUES ($1, $2, $3, $4, 'pending') RETURNING id, created_at`,
        [table_id, customer_name || 'Guest', grandTotal, notes]
    );
    const order = orderRes.rows[0];

    for (const pItem of processedItems) {
        await client.query(
            `INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, modifiers_selected, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [order.id, pItem.menu_item_id, pItem.quantity, pItem.price_per_unit, pItem.total_price, pItem.modifiers_json, pItem.notes]
        );
    }

    await client.query('COMMIT');

    // --- SOCKET EMIT (REAL-TIME) ---
    try {
        const io = getIO();
        io.to('role:waiter').emit('order:new', {
            orderId: order.id,
            tableNumber: tableNumber,
            total: grandTotal,
            items: processedItems,
            createdAt: order.created_at
        });
        io.to(`table:${table_id}`).emit('order:update', { status: 'pending', orderId: order.id });
        // console.log(`📡 Socket emit: order:new for Table ${tableNumber}`);
    } catch (sErr) {
        console.error("Socket emit error:", sErr.message);
    }
    // -------------------------------
    
    res.status(201).json({ 
        message: 'Order placed successfully', 
        order_id: order.id, 
        total: grandTotal,
        status: 'pending' 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// URL: PATCH /api/orders/:id/items
router.patch('/:id/items', async (req, res, next) => {
    const client = await db.pool.connect();
    try {
        const orderId = req.params.id;
        const { items } = req.body;

        if (!items || items.length === 0) return res.status(400).json({ message: 'Item list is empty' });

        await client.query('BEGIN');

        const orderRes = await client.query("SELECT * FROM orders WHERE id = $1", [orderId]);
        if (orderRes.rowCount === 0) return res.status(404).json({ message: 'Order not found' });
        const currentOrder = orderRes.rows[0];

        if (['paid', 'cancelled'].includes(currentOrder.status)) {
            return res.status(400).json({ message: 'Cannot add items to a paid or cancelled order' });
        }

        let additionalTotal = 0;
        const newItemsInfo = [];
        
        for (const item of items) {
            const itemRes = await client.query("SELECT price, name FROM menu_items WHERE id = $1", [item.menu_item_id]);
            const basePrice = parseFloat(itemRes.rows[0].price);
            let modifiersPrice = 0;
            if (itemRes.rowCount === 0) throw new Error(`Item ${item.menu_item_id} not found`);
            if (item.modifiers && Array.isArray(item.modifiers)) {
                modifiersPrice = item.modifiers.reduce((sum, mod) => sum + parseFloat(mod.price || 0), 0);
            }

            const unitTotal = basePrice + modifiersPrice;
            const lineTotal = unitTotal * item.quantity;
            additionalTotal += lineTotal;

            await client.query(
                `INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, modifiers_selected, notes, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
                [orderId, item.menu_item_id, item.quantity, basePrice, lineTotal, JSON.stringify(item.modifiers || []), item.notes]
            );
            newItemsInfo.push({ name: itemRes.rows[0].name, quantity: item.quantity });
        }

        const newTotal = parseFloat(currentOrder.total_amount) + additionalTotal;
        await client.query("UPDATE orders SET total_amount = $1, updated_at = NOW() WHERE id = $2", [newTotal, orderId]);

        await client.query('COMMIT');

        // Socket: Báo Waiter có món thêm
        try{
            const io = getIO();
            io.to('role:waiter').emit('order:updated', { 
                message: 'The customer orders more dishes', 
                orderId, 
                newItems: newItemsInfo 
            });
        } catch (e) { console.error(e.message); }

        res.json({ message: 'Items added successfully', new_total: newTotal });

    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
});

// URL: GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const orderRes = await db.query("SELECT * FROM orders WHERE id = $1", [id]);
        if (orderRes.rowCount === 0) return res.status(404).json({ message: 'Order not found' });

        const itemsRes = await db.query(`
            SELECT oi.*, mi.name as item_name, mi.image_url as item_image
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = $1
        `, [id]);

        res.json({
            ...orderRes.rows[0],
            items: itemsRes.rows
        });
    } catch (err) { next(err); }
});

// URL: GET /api/orders/table/:tableId/order
router.get('/table/:tableId/order', async (req, res, next) => {
    try {
        const { tableId } = req.params;
        const { rows } = await db.query(`
            SELECT * FROM orders 
            WHERE table_id = $1 
            AND status NOT IN ('paid', 'cancelled')
            ORDER BY created_at DESC 
            LIMIT 1
        `, [tableId]);

        if (rows.length === 0) return res.status(404).json({ message: 'No active order found for this table' });
        
        const order = rows[0];
        const itemsRes = await db.query(`
            SELECT oi.*, mi.name as item_name
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = $1
        `, [order.id]);

        res.json({
            ...order,
            items: itemsRes.rows
        });
    } catch (err) { next(err); }
});

module.exports = router;