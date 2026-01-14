/**
 * Modifiers Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const modifiersController = require("../controllers/modifiers.controller");

// POST /api/admin/menu/modifier-groups - Create group
router.post("/modifier-groups", modifiersController.createGroup);

// GET /api/admin/menu/modifier-groups - Get all groups
router.get("/modifier-groups", modifiersController.getAllGroups);

// PUT /api/admin/menu/modifier-groups/:id - Update group
router.put("/modifier-groups/:id", modifiersController.updateGroup);

// DELETE /api/admin/menu/modifier-groups/:id - Delete group
router.delete("/modifier-groups/:id", modifiersController.deleteGroup);

// POST /api/admin/menu/modifier-groups/:id/options - Add option
router.post("/modifier-groups/:id/options", modifiersController.createOption);

// PUT /api/admin/menu/modifier-options/:id - Update option
router.put("/modifier-options/:id", modifiersController.updateOption);

// DELETE /api/admin/menu/modifier-options/:id - Delete option
router.delete("/modifier-options/:id", modifiersController.deleteOption);

module.exports = router;
