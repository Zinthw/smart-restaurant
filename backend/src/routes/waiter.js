/**
 * Waiter Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require('express');
const router = express.Router();
const waiterController = require('../controllers/waiter.controller');

// GET /api/waiter/orders - Get orders for waiter
router.get('/orders', waiterController.getOrders);

// PATCH /api/waiter/orders/:id/accept - Accept order
router.patch('/orders/:id/accept', waiterController.acceptOrder);

// PATCH /api/waiter/orders/:id/reject - Reject order
router.patch('/orders/:id/reject', waiterController.rejectOrder);

// PATCH /api/waiter/orders/:id/served - Mark as served
router.patch('/orders/:id/served', waiterController.serveOrder);

module.exports = router;