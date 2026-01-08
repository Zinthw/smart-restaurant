require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkOrders() {
  try {
    const { rows } = await pool.query(`
      SELECT o.id, o.status, o.customer_name, t.table_number, o.created_at
      FROM orders o 
      JOIN tables t ON o.table_id = t.id 
      WHERE o.status IN ('pending', 'accepted', 'preparing', 'ready') 
      ORDER BY o.created_at DESC 
      LIMIT 10
    `);

    console.log("Active Orders:");
    console.table(rows);

    if (rows.length === 0) {
      console.log(
        "\n⚠️ Không có đơn hàng active! Chạy migrate.js để tạo dữ liệu mẫu."
      );
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkOrders();
