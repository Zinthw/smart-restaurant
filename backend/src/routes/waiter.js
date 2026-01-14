/**
 * Waiter Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require('express');
const router = express.Router();
const waiterController = require('../controllers/waiter.controller');

// GET /api/waiter/orders - Get orders for waiter
router.get('/orders', waiterController.getOrders);

// GET /api/waiter/items/ready - Get items ready to serve
router.get('/items/ready', waiterController.getReadyItems);

// PATCH /api/waiter/orders/:id/accept - Accept order
router.patch('/orders/:id/accept', waiterController.acceptOrder);

// PATCH /api/waiter/orders/:id/reject - Reject order
router.patch('/orders/:id/reject', waiterController.rejectOrder);

// PATCH /api/waiter/orders/:id/served - Mark as served
router.patch('/orders/:id/served', waiterController.serveOrder);

// PATCH /api/waiter/items/:itemId/served - Mark item as served
router.patch('/items/:itemId/served', waiterController.serveItem);

module.exports = router;