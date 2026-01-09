const db = require("./src/db");

async function fix() {
  try {
    await db.query(
      "ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_status_check"
    );
    await db.query(
      "ALTER TABLE menu_items ADD CONSTRAINT menu_items_status_check CHECK (status IN ('available', 'unavailable', 'sold_out', 'hidden'))"
    );
    console.log("Constraint updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

fix();
