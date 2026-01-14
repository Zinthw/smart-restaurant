/**
 * Reviews Controller
 * Handles all menu item review operations
 */

const db = require("../db");

/**
 * GET /api/menu/reviews/:itemId
 * Get reviews for a menu item (public)
 */
exports.getByItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { rows } = await db.query(
      `
      SELECT r.*, c.full_name as customer_name
      FROM item_reviews r
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.menu_item_id = $1
      ORDER BY r.created_at DESC
    `,
      [itemId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/menu/reviews/stats/:itemId
 * Get review statistics for a menu item
 */
exports.getStats = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { rows } = await db.query(
      `
      SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(rating)::numeric, 1) as avg_rating,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star
      FROM item_reviews
      WHERE menu_item_id = $1
    `,
      [itemId]
    );
    res.json(rows[0] || { total_reviews: 0, avg_rating: 0 });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/menu/reviews
 * Create or update review (requires customer login)
 */
exports.create = async (req, res, next) => {
  try {
    const { menu_item_id, rating, comment } = req.body;
    const customer_id = req.customer.customerId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating phải từ 1 đến 5" });
    }

    if (!menu_item_id) {
      return res.status(400).json({ message: "menu_item_id là bắt buộc" });
    }

    // Kiểm tra xem customer đã review món này chưa
    const existingReview = await db.query(
      "SELECT id FROM item_reviews WHERE customer_id = $1 AND menu_item_id = $2",
      [customer_id, menu_item_id]
    );

    if (existingReview.rowCount > 0) {
      // Update review cũ
      const { rows } = await db.query(
        `
        UPDATE item_reviews 
        SET rating = $1, comment = $2, created_at = NOW()
        WHERE customer_id = $3 AND menu_item_id = $4
        RETURNING *
      `,
        [rating, comment, customer_id, menu_item_id]
      );
      return res.json({ message: "Đã cập nhật đánh giá", review: rows[0] });
    }

    // Tạo review mới
    const { rows } = await db.query(
      `
      INSERT INTO item_reviews (customer_id, menu_item_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [customer_id, menu_item_id, rating, comment]
    );

    res.status(201).json({ message: "Đã thêm đánh giá", review: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/menu/my-reviews
 * Get current customer's reviews
 */
exports.getMyReviews = async (req, res, next) => {
  try {
    const customer_id = req.customer.customerId;
    const { rows } = await db.query(
      `
      SELECT r.*, m.name as item_name, m.price
      FROM item_reviews r
      JOIN menu_items m ON r.menu_item_id = m.id
      WHERE r.customer_id = $1
      ORDER BY r.created_at DESC
    `,
      [customer_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
