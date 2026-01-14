/**
 * Reviews Routes
 * MVC Pattern: Routes only define endpoints, logic is in controller
 */

const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");
const { requireCustomer } = require("../middleware/authMiddleware");

// GET /api/menu/reviews/:itemId - Get reviews for item (public)
router.get("/reviews/:itemId", reviewsController.getByItem);

// GET /api/menu/reviews/stats/:itemId - Get review stats
router.get("/reviews/stats/:itemId", reviewsController.getStats);

// POST /api/menu/reviews - Create review (requires customer login)
router.post("/reviews", requireCustomer, reviewsController.create);

// GET /api/menu/my-reviews - Get current customer's reviews
router.get("/my-reviews", requireCustomer, reviewsController.getMyReviews);

module.exports = router;
