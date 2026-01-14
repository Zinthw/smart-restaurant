/**
 * Payment Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// GET /api/payment/tables/:tableId/bill - Get bill for table
router.get('/tables/:tableId/bill', paymentController.getBill);

// POST /api/payment/orders/:id/pay - Process payment
router.post('/orders/:id/pay', paymentController.processPayment);

// GET /api/payment/orders/:id/receipt - Get receipt
router.get('/orders/:id/receipt', paymentController.getReceipt);

module.exports = router;