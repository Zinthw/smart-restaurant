const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); //
const router = express.Router();

// 1. Get Profile
// GET /api/users/profile
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, email, full_name, phone, avatar_url, role FROM users WHERE id = $1",
      [req.user.userId]
    );
    if (!rows[0]) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// 2. Update Profile & Avatar
// PUT /api/users/profile
router.put('/profile', requireAuth, upload.single('avatar'), async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;
    let avatar_url = req.body.avatar_url;

    if (req.file) {
      avatar_url = `/uploads/${req.file.filename}`;
    }

    const { rows } = await db.query(`
      UPDATE users 
      SET full_name = COALESCE($1, full_name), 
          phone = COALESCE($2, phone),
          avatar_url = COALESCE($3, avatar_url)
      WHERE id = $4
      RETURNING id, full_name, phone, avatar_url, email
    `, [full_name, phone, avatar_url, req.user.userId]);

    res.json({ message: "Profile updated", user: rows[0] });
  } catch (err) { next(err); }
});

// 3. Change Password
// PUT /api/users/change-password
router.put('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const { rows } = await db.query("SELECT password_hash FROM users WHERE id = $1", [req.user.userId]);
    const user = rows[0];

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(400).json({ message: "Incorrect current password" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, req.user.userId]);

    res.json({ message: "Password updated successfully" });
  } catch (err) { next(err); }
});

// 4. Order History
// GET /api/users/history
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    // Lấy danh sách đơn hàng của user này
    const { rows } = await db.query(`
      SELECT o.*, 
             json_agg(json_build_object('name', m.name, 'quantity', oi.quantity, 'price', oi.price_per_unit)) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.userId]);

    res.json(rows);
  } catch (err) { next(err); }
});

// 5. Admin Manage: List Admins (Cho Super Admin tạo Admin khác)
// GET /api/users/admins
router.get('/admins', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
        const { rows } = await db.query("SELECT id, email, full_name, status FROM users WHERE role = 'admin'");
        res.json(rows);
    } catch(err) { next(err); }
});

module.exports = router;