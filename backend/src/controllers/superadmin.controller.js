/**
 * Super Admin Controller
 * Handles super admin operations
 */

const db = require("../db");
const bcrypt = require("bcrypt");

/**
 * GET /api/superadmin/admins
 * List all admins
 */
exports.listAdmins = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, email, role, status, created_at 
       FROM users 
       WHERE role = 'admin'
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/superadmin/admins
 * Create new admin
 */
exports.createAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check email đã tồn tại chưa
    const check = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (check.rowCount > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, role, status)
       VALUES ($1, $2, 'admin', 'active')
       RETURNING id, email, role, status, created_at`,
      [email, hash]
    );

    res.status(201).json({
      message: "Admin created successfully",
      admin: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/superadmin/admins/:id/status
 * Update admin status
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Status must be active or inactive" });
    }

    const { rows } = await db.query(
      `UPDATE users 
       SET status = $1 
       WHERE id = $2 AND role = 'admin'
       RETURNING id, email, role, status`,
      [status, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: `Admin ${status === 'active' ? 'activated' : 'deactivated'}`, admin: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/superadmin/admins/:id
 * Delete admin
 */
exports.deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `DELETE FROM users 
       WHERE id = $1 AND role = 'admin'
       RETURNING id, email`,
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin deleted successfully", deletedAdmin: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/superadmin/stats
 * System statistics
 */
exports.getStats = async (req, res, next) => {
  try {
    const [admins, staff, tables, items, orders] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE role = 'admin'"),
      db.query("SELECT COUNT(*) FROM users WHERE role IN ('staff', 'waiter', 'kitchen')"),
      db.query("SELECT COUNT(*) FROM tables"),
      db.query("SELECT COUNT(*) FROM menu_items WHERE deleted_at IS NULL"),
      db.query("SELECT COUNT(*) FROM orders WHERE status = 'paid'")
    ]);

    res.json({
      totalAdmins: parseInt(admins.rows[0].count),
      totalStaff: parseInt(staff.rows[0].count),
      totalTables: parseInt(tables.rows[0].count),
      totalMenuItems: parseInt(items.rows[0].count),
      totalPaidOrders: parseInt(orders.rows[0].count)
    });
  } catch (err) {
    next(err);
  }
};
