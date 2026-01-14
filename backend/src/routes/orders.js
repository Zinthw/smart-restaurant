/**
 * Orders Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");

// GET /api/orders - Get all orders (Admin)
router.get("/", ordersController.getAll);

// POST /api/orders - Create new order
router.post("/", ordersController.create);

// GET /api/orders/table/:tableId/order - Get orders by table
// NOTE: This route must come BEFORE /:id to avoid matching 'table' as an id
router.get("/table/:tableId/order", ordersController.getByTable);

// GET /api/orders/:id - Get order by ID
router.get("/:id", ordersController.getById);

// PATCH /api/orders/:id/items - Add items to order
router.patch("/:id/items", ordersController.addItems);

// PATCH /api/orders/:id/attach-customer - Attach customer to order
router.patch("/:id/attach-customer", ordersController.attachCustomer);

// POST /api/orders/:id/request-bill - Request bill from waiter
router.post("/:id/request-bill", ordersController.requestBill);

module.exports = router;
