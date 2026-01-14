/**
 * QR Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const qrController = require("../controllers/qr.controller");

// ============ PUBLIC: Verify QR Token ============
// GET /api/qr/verify?tableId=xxx&token=xxx
router.get("/verify", qrController.verify);

// ============ ADMIN ROUTES ============
// GET /api/admin/tables/qr/download-all?format=png|pdf
router.get("/qr/download-all", qrController.downloadAll);

// POST /api/admin/tables/:id/qr/generate
router.post("/:id/qr/generate", qrController.generate);

// GET /api/admin/tables/:id/qr/download
router.get("/:id/qr/download", qrController.download);

// POST /api/admin/tables/qr/regenerate-all
router.post("/qr/regenerate-all", qrController.regenerateAll);

module.exports = router;
