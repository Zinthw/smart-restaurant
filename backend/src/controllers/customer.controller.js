/**
 * Customer Controller
 * Handles customer profile and account operations
 */

const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * GET /api/customer/profile
 * Get current customer profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, full_name, phone, email, role, avatar_url as avatar, created_at, total_points, tier 
       FROM users WHERE id = $1`,
      [req.user.userId]
    );
    if (!rows[0]) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

/**
 * PUT /api/customer/profile
 * Update customer profile with avatar upload
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    let avatarPath = null;

    // Nếu người dùng có gửi file ảnh mới
    if (req.file) {
        // Lưu đường dẫn tương đối để frontend dễ ghép URL
        avatarPath = `/uploads/${req.file.filename}`;
    }

    // Câu lệnh SQL thông minh:
    // - COALESCE($1, full_name): Nếu fullName gửi lên null/rỗng thì giữ nguyên cái cũ
    // - COALESCE($3, avatar_url): Nếu không upload ảnh mới (avatarPath null) thì giữ ảnh cũ
    const { rows } = await db.query(
      `UPDATE users 
       SET full_name = COALESCE(NULLIF($1, ''), full_name), 
           phone = COALESCE(NULLIF($2, ''), phone),
           avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4 
       RETURNING id, full_name, phone, email, avatar_url as avatar`,
      [fullName, phone, avatarPath, req.user.userId]
    );

    res.json({ message: "Cập nhật thành công", customer: rows[0] });
  } catch (err) { next(err); }
};

/**
 * GET /api/customer/orders
 * Get customer order history
 */
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows } = await db.query(
      `SELECT o.*, t.table_number,
              json_agg(json_build_object(
                  'name', m.name, 'quantity', oi.quantity, 'price', oi.total_price
              )) as items
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items m ON oi.menu_item_id = m.id
       WHERE o.user_id = $1
       GROUP BY o.id, t.table_number
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    );

    const countRes = await db.query("SELECT COUNT(*) FROM orders WHERE user_id = $1", [req.user.userId]);

    res.json({
      orders: rows,
      pagination: { total: parseInt(countRes.rows[0].count), page, limit }
    });
  } catch (err) { next(err); }
};

/**
 * GET /api/customer/points
 * Get customer loyalty points
 */
exports.getPoints = async (req, res, next) => {
    try {
        const { rows } = await db.query("SELECT total_points, tier FROM users WHERE id = $1", [req.user.userId]);
        const points = rows[0]?.total_points || 0;
        const tier = rows[0]?.tier || 'Bronze';

        const tierThresholds = {
            Bronze: { next: "Silver", threshold: 1000 },
            Silver: { next: "Gold", threshold: 5000 },
            Gold: { next: "Platinum", threshold: 10000 },
            Platinum: { next: null, threshold: null },
        };
        
        // Fix lỗi chữ hoa/thường bằng cách chuẩn hóa key
        const normalizeTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
        const currentTierData = tierThresholds[normalizeTier] || tierThresholds["Bronze"];
        
        const nextTier = currentTierData.next;
        const pointsToNext = nextTier ? (currentTierData.threshold - points) : 0;

        res.json({
            totalPoints: points,
            currentTier: tier,
            nextTier,
            pointsToNextTier: pointsToNext > 0 ? pointsToNext : 0,
        });
    } catch(err) {
        next(err);
    }
};

/**
 * PUT /api/customer/change-password
 * Change customer password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (newPassword.length < 6) return res.status(400).json({ message: "Mật khẩu mới quá ngắn" });

    const { rows } = await db.query("SELECT password_hash, auth_provider FROM users WHERE id = $1", [req.user.userId]);
    
    if (rows[0].auth_provider === 'google') return res.status(400).json({ message: "Tài khoản Google không thể đổi mật khẩu." });

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(401).json({ message: "Mật khẩu cũ không đúng" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, req.user.userId]);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) { next(err); }
};
