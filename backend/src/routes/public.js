/**
 * Public Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public.controller");

// GET /api/menu/verify - Verify QR code
router.get("/verify", publicController.verifyQR);

// GET /api/menu/categories - Get active categories
router.get("/categories", publicController.getCategories);

// GET /api/menu/items - Get menu items
router.get("/items", publicController.getItems);

module.exports = router;
