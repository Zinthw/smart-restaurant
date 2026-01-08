const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/reviews/item/:itemId
router.get('/item/:itemId', async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { rows } = await db.query(`
      SELECT r.*, u.full_name, u.avatar_url 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.menu_item_id = $1
      ORDER BY r.created_at DESC
    `, [itemId]);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/reviews
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { menu_item_id, rating, comment } = req.body;
    const user_id = req.user.userId; // Từ token

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const { rows } = await db.query(`
      INSERT INTO reviews (user_id, menu_item_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [user_id, menu_item_id, rating, comment]);

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;