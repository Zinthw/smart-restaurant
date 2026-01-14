/**
 * Categories Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categories.controller");

// GET /api/admin/menu/categories - Get all categories
router.get("/", categoriesController.getAll);

// POST /api/admin/menu/categories - Create category
router.post("/", categoriesController.create);

// PUT /api/admin/menu/categories/:id - Update category
router.put("/:id", categoriesController.update);

// PATCH /api/admin/menu/categories/:id/status - Update status
router.patch("/:id/status", categoriesController.updateStatus);

// DELETE /api/admin/menu/categories/:id - Delete category
router.delete("/:id", categoriesController.remove);

module.exports = router;
