/**
 * Photos Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const photosController = require("../controllers/photos.controller");
const upload = require("../middleware/uploadMiddleware");

// POST /api/admin/menu/items/:id/photos/from-url - Add from URLs (must be before /:id/photos)
router.post("/:id/photos/from-url", photosController.addFromUrl);

// POST /api/admin/menu/items/:id/photos - Upload photos
router.post("/:id/photos", upload.array("photos", 5), photosController.upload);

// DELETE /api/admin/menu/items/:id/photos/:photoId - Delete photo
router.delete("/:id/photos/:photoId", photosController.remove);

// PATCH /api/admin/menu/items/:id/photos/:photoId/primary - Set primary
router.patch("/:id/photos/:photoId/primary", photosController.setPrimary);

module.exports = router;
