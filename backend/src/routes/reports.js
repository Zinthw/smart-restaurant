/**
 * Reports Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

// GET /api/admin/reports/daily - Daily revenue report
router.get('/daily', reportsController.getDaily);

// GET /api/admin/reports/top-items - Top selling items
router.get('/top-items', reportsController.getTopItems);

// GET /api/admin/reports/summary - Dashboard summary
router.get('/summary', reportsController.getSummary);

module.exports = router;