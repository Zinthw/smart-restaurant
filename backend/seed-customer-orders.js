require("dotenv").config();
const db = require("./src/db");

async function seedCustomerOrders() {
  try {
    // Get customer
    const cust = await db.query(
      "SELECT id FROM customers WHERE email = 'customer1@example.com'"
    );
    if (!cust.rows[0]) {
      console.log("Customer not found");
      process.exit(1);
    }
    const customerId = cust.rows[0].id;
    console.log("Customer ID:", customerId);

    // Get tables and items
    const tables = await db.query(
      "SELECT id, table_number FROM tables LIMIT 3"
    );
    const items = await db.query(
      "SELECT id, name, price FROM menu_items LIMIT 4"
    );

    console.log("Tables:", tables.rows.length);
    console.log("Items:", items.rows.length);

    // Create 3 past orders for this customer
    for (let i = 0; i < 3; i++) {
      const daysAgo = i * 3 + 1;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const item1 = items.rows[i % items.rows.length];
      const item2 = items.rows[(i + 1) % items.rows.length];
      const total = parseFloat(item1.price) + parseFloat(item2.price);

      const order = await db.query(
        `INSERT INTO orders (table_id, customer_id, customer_name, status, total_amount, paid_at, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id`,
        [
          tables.rows[i].id,
          customerId,
          "Nguyen Van A",
          "paid",
          total,
          date.toISOString(),
        ]
      );

      await db.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, status) 
         VALUES ($1, $2, 1, $3, $3, $4), ($1, $5, 1, $6, $6, $4)`,
        [order.rows[0].id, item1.id, item1.price, "paid", item2.id, item2.price]
      );

      console.log(
        `Created order ${i + 1}: ${item1.name} + ${item2.name} = ${total}`
      );
    }

    console.log("✅ Created 3 orders for customer1@example.com");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

seedCustomerOrders();
