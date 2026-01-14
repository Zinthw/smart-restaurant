/**
 * Items Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/items.controller");

// GET /api/admin/menu/items - Get all items
router.get("/", itemsController.getAll);

// GET /api/admin/menu/items/:id - Get item by ID
router.get("/:id", itemsController.getById);

// POST /api/admin/menu/items - Create item
router.post("/", itemsController.create);

// PUT /api/admin/menu/items/:id - Update item
router.put("/:id", itemsController.update);

// DELETE /api/admin/menu/items/:id - Delete item
router.delete("/:id", itemsController.remove);

// PATCH /api/admin/menu/items/:id/status - Update status
router.patch("/:id/status", itemsController.updateStatus);

// GET /api/admin/menu/items/:id/modifier-groups - Get modifier groups
router.get("/:id/modifier-groups", itemsController.getModifierGroups);

// POST /api/admin/menu/items/:id/modifier-groups - Set modifier groups
router.post("/:id/modifier-groups", itemsController.setModifierGroups);

module.exports = router;
