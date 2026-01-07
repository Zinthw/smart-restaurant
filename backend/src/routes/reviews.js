const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/menu/:itemId/reviews
router.get("/:itemId/reviews", async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Lấy danh sách reviews
    const { rows } = await db.query(
      `SELECT r.*, c.full_name as customer_name
       FROM item_reviews r
       LEFT JOIN customers c ON r.customer_id = c.id
       WHERE r.menu_item_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [itemId, limit, offset]
    );

    // Đếm tổng và tính trung bình
    const statsRes = await db.query(
      `SELECT COUNT(*) as total, COALESCE(AVG(rating), 0) as average_rating
       FROM item_reviews WHERE menu_item_id = $1`,
      [itemId]
    );

    const stats = statsRes.rows[0];

    res.json({
      reviews: rows,
      stats: {
        total: parseInt(stats.total),
        averageRating: parseFloat(stats.average_rating).toFixed(1)
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/menu/:itemId/reviews (Requires customer auth)
router.post("/:itemId/reviews", async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { rating, comment } = req.body;
    
    // Kiểm tra customer đã login chưa
    if (!req.customer || !req.customer.customerId) {
      return res.status(401).json({ message: "Please login to submit a review" });
    }
    
    const customerId = req.customer.customerId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Kiểm tra item có tồn tại không
    const itemCheck = await db.query(
      "SELECT 1 FROM menu_items WHERE id = $1 AND deleted_at IS NULL",
      [itemId]
    );
    if (itemCheck.rowCount === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Kiểm tra customer đã review item này chưa
    const existingReview = await db.query(
      "SELECT 1 FROM item_reviews WHERE menu_item_id = $1 AND customer_id = $2",
      [itemId, customerId]
    );
    if (existingReview.rowCount > 0) {
      return res.status(400).json({ message: "You have already reviewed this item" });
    }

    // Tạo review
    const { rows } = await db.query(
      `INSERT INTO item_reviews (menu_item_id, customer_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [itemId, customerId, rating, comment || null]
    );

    res.status(201).json({ 
      message: "Review submitted successfully", 
      review: rows[0] 
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/menu/:itemId/reviews/:reviewId (Customer can delete own review)
router.delete("/:itemId/reviews/:reviewId", async (req, res, next) => {
  try {
    const { itemId, reviewId } = req.params;
    
    if (!req.customer || !req.customer.customerId) {
      return res.status(401).json({ message: "Please login" });
    }

    const customerId = req.customer.customerId;

    const { rows } = await db.query(
      `DELETE FROM item_reviews 
       WHERE id = $1 AND menu_item_id = $2 AND customer_id = $3
       RETURNING *`,
      [reviewId, itemId, customerId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Review not found or not yours" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
