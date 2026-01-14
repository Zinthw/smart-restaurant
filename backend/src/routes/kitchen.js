/**
 * Kitchen Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const kitchenController = require("../controllers/kitchen.controller");

// GET /api/kitchen/orders - Get orders for KDS
router.get("/orders", kitchenController.getOrders);

// PATCH /api/kitchen/items/:itemId/status - Update item status
router.patch("/items/:itemId/status", kitchenController.updateItemStatus);

// PATCH /api/kitchen/orders/:id/preparing - Start preparing order
router.patch("/orders/:id/preparing", kitchenController.startPreparing);

// PATCH /api/kitchen/orders/:id/ready - Mark order ready
router.patch("/orders/:id/ready", kitchenController.markReady);

module.exports = router;
