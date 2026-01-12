require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

// Kết nối Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("🔄 Starting migration & Seeding...");

    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // --- 1. CLEANUP (Reset database) ---
    await client.query(
      `DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres;`
    );
    console.log("✅ Reset Database");

    // --- 2. CREATE TABLES (Khớp với database.sql mới) ---

    // Users (Hợp nhất cả Staff và Guest/Customer)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(120) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        full_name VARCHAR(100),
        phone VARCHAR(20),
        avatar_url TEXT,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'waiter', 'kitchen', 'guest')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
        
        -- Các cột phục vụ Google Login & Khách hàng (Guest)
        auth_provider VARCHAR(20) DEFAULT 'local',
        google_id VARCHAR(255),
        total_points INT DEFAULT 0,
        tier VARCHAR(50) DEFAULT 'Bronze',
        
        -- Token khôi phục mật khẩu
        verification_token VARCHAR(255),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "users" ready (unified with guests)');

    // Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_number VARCHAR(50) NOT NULL UNIQUE,
        capacity INT NOT NULL CHECK (capacity > 0 AND capacity <= 20),
        location VARCHAR(100),
        description TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        qr_token TEXT,
        qr_token_created_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "tables" ready');

    // Menu System
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP 
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_category_name_not_deleted ON menu_categories (name) WHERE deleted_at IS NULL;
    
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID REFERENCES menu_categories(id),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'sold_out', 'hidden')),
        is_chef_recommended BOOLEAN DEFAULT false,
        prep_time_minutes INT DEFAULT 15 CHECK (prep_time_minutes >= 0 AND prep_time_minutes <= 240),
        order_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP 
      );
      CREATE INDEX IF NOT EXISTS idx_items_category ON menu_items(category_id);
    
      CREATE TABLE IF NOT EXISTS menu_item_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Menu system ready");

    // Modifiers
    await client.query(`
      CREATE TABLE IF NOT EXISTS modifier_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        selection_type VARCHAR(20) DEFAULT 'single' CHECK (selection_type IN ('single', 'multiple')), 
        is_required BOOLEAN DEFAULT false,
        min_selection INT DEFAULT 0,
        max_selection INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    
      CREATE TABLE IF NOT EXISTS modifier_options (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        price_adjustment DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    
      CREATE TABLE IF NOT EXISTS menu_item_modifier_groups (
        menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
        modifier_group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
        sort_order INT DEFAULT 0,
        PRIMARY KEY (menu_item_id, modifier_group_id)
      );
    `);
    console.log("Modifiers ready");

    // Reviews (đổi tên từ item_reviews, dùng user_id thay vì customer_id)
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        menu_item_id UUID REFERENCES menu_items(id),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Reviews ready");

    // Orders (dùng user_id thay vì customer_id)
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id UUID REFERENCES tables(id),
        user_id UUID REFERENCES users(id),
        customer_name VARCHAR(100), 
        customer_phone VARCHAR(20), 
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'served', 'paid', 'cancelled')),
        total_amount DECIMAL(12, 2) DEFAULT 0,
        discount_amount DECIMAL(12, 2) DEFAULT 0,
        notes TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id UUID REFERENCES menu_items(id),
        quantity INT NOT NULL CHECK (quantity > 0),
        price_per_unit DECIMAL(12, 2) NOT NULL, 
        total_price DECIMAL(12, 2) NOT NULL,   
        modifiers_selected JSONB DEFAULT '[]',  
        notes TEXT, 
        status VARCHAR(20) DEFAULT 'pending',  
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Orders ready");

    console.log("✅ ==== TABLES CREATED ====");

    // --- 3. SEED DATA ---

    // 3.1 Users (Staff + Guest trong cùng bảng)
    const passwordHash = await bcrypt.hash("123456", 10);
    
    // Staff users
    await client.query(
      `
      INSERT INTO users (email, password_hash, full_name, role, status) VALUES 
      ('admin@restaurant.com', $1, 'Admin User', 'admin', 'active'),
      ('waiter@restaurant.com', $1, 'Waiter User', 'waiter', 'active'),
      ('kitchen@restaurant.com', $1, 'Kitchen User', 'kitchen', 'active'),
      ('staff@restaurant.com', $1, 'Staff User', 'staff', 'active')
    `,
      [passwordHash]
    );
    console.log("🌱 Seeded 4 Staff Users (Pass: 123456)");

    // Guest users (khách hàng có tài khoản - role: 'guest')
    const guestRes = await client.query(
      `
      INSERT INTO users (email, password_hash, full_name, phone, role, total_points, tier, status) VALUES 
      ('guest1@example.com', $1, 'Nguyễn Văn A', '0909111111', 'guest', 150, 'Silver', 'active'),
      ('guest2@example.com', $1, 'Trần Thị B', '0909222222', 'guest', 50, 'Bronze', 'active')
      RETURNING id, full_name
    `,
      [passwordHash]
    );
    const guests = guestRes.rows;
    console.log("🌱 Seeded 2 Guest Users (Pass: 123456)");

    // 3.2 Tables (15 bàn cho quán lớn)
    const tablesData = [];
    for (let i = 1; i <= 5; i++) tablesData.push(`('T-0${i}', 2, 'Indoor')`);
    for (let i = 6; i <= 10; i++)
      tablesData.push(`('T-${i < 10 ? "0" + i : i}', 4, 'Window')`);
    for (let i = 1; i <= 3; i++)
      tablesData.push(`('VIP-${i}', 8, 'Private Room')`);
    for (let i = 1; i <= 2; i++) tablesData.push(`('OUT-${i}', 4, 'Garden')`);

    const tablesRes = await client.query(`
      INSERT INTO tables (table_number, capacity, location) 
      VALUES ${tablesData.join(",")}
      RETURNING id, table_number
    `);
    const tables = tablesRes.rows;
    console.log(`🌱 Seeded ${tables.length} Tables`);

    // 3.3 Menu System
    const catRes = await client.query(`
      INSERT INTO menu_categories (name, sort_order) VALUES 
      ('Khai vị', 1), ('Món chính', 2), ('Tráng miệng', 3), ('Đồ uống', 4)
      RETURNING id, name
    `);
    const cats = catRes.rows;

    const modGroupRes = await client.query(`
      INSERT INTO modifier_groups (name, selection_type, is_required) VALUES 
      ('Mức độ chín', 'single', true), ('Toppings', 'multiple', false), 
      ('Đường', 'single', false), ('Đá', 'single', false)
      RETURNING id, name
    `);
    const modGroups = modGroupRes.rows;

    // Options
    await client.query(
      `INSERT INTO modifier_options (group_id, name) VALUES 
      ($1, 'Rare'), ($1, 'Medium'), ($1, 'Well Done')`,
      [modGroups[0].id]
    );
    await client.query(
      `INSERT INTO modifier_options (group_id, name, price_adjustment) VALUES 
      ($1, 'Phô mai', 10000), ($1, 'Trứng ốp', 5000)`,
      [modGroups[1].id]
    );
    await client.query(
      `INSERT INTO modifier_options (group_id, name) VALUES 
      ($1, '0%'), ($1, '50%'), ($1, '100%')`,
      [modGroups[2].id]
    );

    // Items
    const itemRes = await client.query(
      `
      INSERT INTO menu_items (category_id, name, price, description, is_chef_recommended, status) VALUES 
      ($1, 'Salad Caesar', 85000, 'Rau tươi, sốt đặc biệt', false, 'available'),
      ($1, 'Súp bí đỏ', 60000, 'Kem tươi, hạt bí', true, 'available'),
      ($2, 'Bò Beefsteak', 250000, 'Thăn ngoại bò Úc', true, 'available'),
      ($2, 'Cá hồi áp chảo', 220000, 'Sốt chanh leo', false, 'available'),
      ($2, 'Mỳ Ý Carbonara', 120000, 'Sốt kem, thịt hun khói', false, 'available'),
      ($3, 'Bánh Tiramisu', 75000, 'Vị cafe truyền thống', true, 'available'),
      ($4, 'Trà sữa trân châu', 55000, 'Đường đen', false, 'available'),
      ($4, 'Coca Cola', 20000, 'Lon 330ml', false, 'available')
      RETURNING id, name, price
    `,
      [cats[0].id, cats[1].id, cats[2].id, cats[3].id]
    );
    const items = itemRes.rows;
    console.log(`🌱 Seeded ${items.length} Menu Items`);

    // 3.4 GENERATE PAST ORDERS (Cho Reports API)
    console.log("⏳ Generating 50 past orders for reports...");

    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      const dateStr = orderDate.toISOString();

      const table = tables[Math.floor(Math.random() * tables.length)];
      const item1 = items[Math.floor(Math.random() * items.length)];
      const item2 = items[Math.floor(Math.random() * items.length)];

      const total = parseFloat(item1.price) + parseFloat(item2.price);

      // Random gắn user_id cho một số order (để test loyalty)
      const userId = Math.random() > 0.7 ? guests[Math.floor(Math.random() * guests.length)].id : null;

      const res = await client.query(
        `
            INSERT INTO orders (table_id, user_id, customer_name, status, total_amount, paid_at, created_at)
            VALUES ($1, $2, 'Guest Past', 'paid', $3, $4, $4) RETURNING id
        `,
        [table.id, userId, total, dateStr]
      );
      const orderId = res.rows[0].id;

      await client.query(
        `
            INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, status, created_at)
            VALUES 
            ($1, $2, 1, $3, $3, 'paid', $5),
            ($1, $4, 1, $6, $6, 'paid', $5)
        `,
        [orderId, item1.id, item1.price, item2.id, dateStr, item2.price]
      );
    }
    console.log("🌱 Seeded 50 Past Orders (Paid)");

    // 3.5 ACTIVE ORDERS SCENARIOS (Cho Waiter/KDS Testing)
    console.log("⏳ Generating Active Scenarios...");

    // Case 1: Mới đặt (Pending) - Để Waiter Accept
    const p1 = await client.query(
      `INSERT INTO orders (table_id, customer_name, status, total_amount) VALUES ($1, 'Mr. A (Mới đến)', 'pending', 250000) RETURNING id`,
      [tables[0].id]
    );
    await client.query(
      `INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, status) VALUES ($1, $2, 1, 250000, 250000, 'pending')`,
      [p1.rows[0].id, items.find((i) => i.name.includes("Bò")).id]
    );

    // Case 2: Đã nhận (Accepted) - Để KDS nấu
    const p2 = await client.query(
      `INSERT INTO orders (table_id, customer_name, status, total_amount) VALUES ($1, 'Ms. B (Chờ nấu)', 'accepted', 120000) RETURNING id`,
      [tables[1].id]
    );
    await client.query(
      `INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, status) VALUES ($1, $2, 1, 120000, 120000, 'pending')`,
      [p2.rows[0].id, items.find((i) => i.name.includes("Mỳ")).id]
    );

    // Case 3: Đang nấu (Preparing)
    const p3 = await client.query(
      `INSERT INTO orders (table_id, customer_name, status, total_amount) VALUES ($1, 'Mr. C (Đang nấu)', 'accepted', 85000) RETURNING id`,
      [tables[2].id]
    );
    await client.query(
      `INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, status) VALUES ($1, $2, 1, 85000, 85000, 'preparing')`,
      [p3.rows[0].id, items.find((i) => i.name.includes("Salad")).id]
    );

    // Case 4: Đã xong (Ready) - Để Waiter bưng
    const p4 = await client.query(
      `INSERT INTO orders (table_id, customer_name, status, total_amount) VALUES ($1, 'Family D (Chờ bưng)', 'ready', 55000) RETURNING id`,
      [tables[3].id]
    );
    await client.query(
      `INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, status) VALUES ($1, $2, 1, 55000, 55000, 'ready')`,
      [p4.rows[0].id, items.find((i) => i.name.includes("Trà sữa")).id]
    );

    // Case 5: Đã ăn xong (Served) - Để test Thanh toán
    const p5 = await client.query(
      `INSERT INTO orders (table_id, user_id, customer_name, status, total_amount) VALUES ($1, $2, 'Group E (Ăn xong)', 'served', 470000) RETURNING id`,
      [tables[4].id, guests[0].id]
    );
    await client.query(
      `INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, status) VALUES ($1, $2, 2, 220000, 440000, 'served')`,
      [p5.rows[0].id, items.find((i) => i.name.includes("Cá hồi")).id]
    );

    console.log("🌱 Seeded 5 Active Scenarios (Pending -> Served)");
    console.log("🎉 MIGRATION & SEEDING COMPLETED SUCCESSFULLY!");
    console.log("");
    console.log("📋 Test Accounts:");
    console.log("   Staff: admin@restaurant.com / 123456");
    console.log("   Waiter: waiter@restaurant.com / 123456");
    console.log("   Kitchen: kitchen@restaurant.com / 123456");
    console.log("   Guest: guest1@example.com / 123456");
    console.log("");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
