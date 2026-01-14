/**
 * Super Admin Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const superadminController = require("../controllers/superadmin.controller");

// GET /api/superadmin/admins - List all admins
router.get("/admins", superadminController.listAdmins);

// POST /api/superadmin/admins - Create new admin
router.post("/admins", superadminController.createAdmin);

// PATCH /api/superadmin/admins/:id/status - Update admin status
router.patch("/admins/:id/status", superadminController.updateStatus);

// DELETE /api/superadmin/admins/:id - Delete admin
router.delete("/admins/:id", superadminController.deleteAdmin);

// GET /api/superadmin/stats - System stats
router.get("/stats", superadminController.getStats);

module.exports = router;
