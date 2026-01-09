require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkPhotos() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        m.id, 
        m.name, 
        p.photo_url,
        p.is_primary
      FROM menu_items m
      LEFT JOIN menu_item_photos p ON m.id = p.menu_item_id
      ORDER BY m.name
    `);

    console.log("Menu Items with Photos:");
    console.table(rows);

    const withPhotos = rows.filter((r) => r.photo_url);
    console.log(`\n✅ ${withPhotos.length} items have photos`);
    console.log(`⚠️ ${rows.length - withPhotos.length} items without photos`);

    if (withPhotos.length > 0) {
      console.log("\nSample photo URL:", withPhotos[0].photo_url);
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

checkPhotos();
