/**
 * Tables Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const tablesController = require("../controllers/tables.controller");

// GET /api/admin/tables - Get all tables
router.get("/", tablesController.getAll);

// GET /api/admin/tables/:id - Get table by ID
router.get("/:id", tablesController.getById);

// POST /api/admin/tables - Create table
router.post("/", tablesController.create);

// PUT /api/admin/tables/:id - Update table
router.put("/:id", tablesController.update);

// DELETE /api/admin/tables/:id - Delete table
router.delete("/:id", tablesController.remove);

// PATCH /api/admin/tables/:id/status - Update status
router.patch("/:id/status", tablesController.updateStatus);

module.exports = router;
