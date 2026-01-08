require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

// Kết nối Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("🔄 Starting migration & Seeding...");
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // --- 1. CLEANUP ---
    await client.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres;`);
    console.log("✅ Database Reset Complete");

    // --- 2. CREATE TABLES ---

    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(120) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        full_name VARCHAR(100),
        phone VARCHAR(20),
        avatar_url TEXT,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'waiter', 'kitchen', 'guest')),
        status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'banned')),
        auth_provider VARCHAR(20) DEFAULT 'local',
        google_id VARCHAR(255),
        verification_token VARCHAR(255),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "users" ready');
    
    // Tables
    await pool.query(`
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
    await pool.query(`
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
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold_out', 'hidden')),
        is_chef_recommended BOOLEAN DEFAULT false,
        prep_time_minutes INT DEFAULT 15 CHECK (prep_time_minutes >= 0 AND prep_time_minutes <= 240),
        order_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP 
      );
      CREATE INDEX IF NOT EXISTS idx_items_category ON menu_items(category_id);

      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_items' AND column_name='prep_time_minutes') THEN
          ALTER TABLE menu_items ADD COLUMN prep_time_minutes INT DEFAULT 15 CHECK (prep_time_minutes >= 0 AND prep_time_minutes <= 240);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_items' AND column_name='order_count') THEN
          ALTER TABLE menu_items ADD COLUMN order_count INT DEFAULT 0;
        END IF;
      END $$;
    
      CREATE TABLE IF NOT EXISTS menu_item_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Menu system ready');

    // Modifiers
    await pool.query(`
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
    console.log('Modifiers ready');

    // Reviews
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
    console.log('Reviews ready');

    // Orders
    await pool.query(`
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
    console.log('Orders ready');

    console.log('✅ ====TABLES CREATED.====');


    // --- 3. SEED DATA ---

    // 3.1 Users
    // 3.1 Users (Admin, Staff, Guest - ACTIVE MẶC ĐỊNH ĐỂ TEST)
    const passwordHash = await bcrypt.hash('123456', 10);
    const usersRes = await client.query(`
      INSERT INTO users (email, password_hash, role, full_name, phone, status, auth_provider) VALUES 
      ('admin@restaurant.com', $1, 'admin', 'Super Admin', '0909000111', 'active', 'local'),
      ('waiter@restaurant.com', $1, 'waiter', 'John Waiter', '0909000222', 'active', 'local'),
      ('kitchen@restaurant.com', $1, 'kitchen', 'Chef Gordon', '0909000333', 'active', 'local'),
      ('guest@gmail.com', $1, 'guest', 'Loyal Customer', '0912345678', 'active', 'local')
      RETURNING id, email, role
    `, [passwordHash]);
    const guestUser = usersRes.rows.find(u => u.role === 'guest');
    console.log('🌱 Seeded Users');

    // 3.2 Tables
    const tablesData = [];
    for(let i=1; i<=5; i++) tablesData.push(`('T-0${i}', 2, 'Indoor')`);
    for(let i=6; i<=10; i++) tablesData.push(`('T-${i<10?'0'+i:i}', 4, 'Window')`);
    const tablesRes = await client.query(`
      INSERT INTO tables (table_number, capacity, location) 
      VALUES ${tablesData.join(',')}
      RETURNING id, table_number
    `);
    const tables = tablesRes.rows;
    console.log(`🌱 Seeded ${tables.length} Tables`);

    // 3.3 Menu System
    const catRes = await client.query(`
      INSERT INTO menu_categories (name, sort_order) VALUES 
      ('Khai vị', 1), ('Món chính', 2), ('Đồ uống', 3)
      RETURNING id, name
    `);
    const cats = catRes.rows;

    // Items
    const itemRes = await client.query(`
      INSERT INTO menu_items (category_id, name, price, description, is_chef_recommended) VALUES 
      ($1, 'Salad Caesar', 85000, 'Xà lách tươi, sốt đặc biệt', false),
      ($2, 'Bò Beefsteak', 250000, 'Thăn ngoại bò Úc', true),
      ($2, 'Mỳ Ý Carbonara', 120000, 'Sốt kem thịt hun khói', false),
      ($3, 'Trà sữa trân châu', 55000, 'Đường đen', false),
      ($3, 'Coca Cola', 20000, 'Lon 330ml', false)
      RETURNING id, name, price
    `, [cats[0].id, cats[1].id, cats[2].id]);
    const items = itemRes.rows;
    console.log(`🌱 Seeded ${items.length} Menu Items`);

    // --- SEEDING GUEST HISTORY ---
    console.log("⏳ Seeding Guest History...");

    // Order 1: Đã thanh toán (Hôm qua)
    const order1 = await client.query(`
      INSERT INTO orders (table_id, user_id, customer_name, status, total_amount, paid_at, created_at)
      VALUES ($1, $2, 'Loyal Customer', 'paid', 370000, NOW() - INTERVAL '1 DAY', NOW() - INTERVAL '1 DAY')
      RETURNING id
    `, [tables[0].id, guestUser.id]);
    
    // Insert Items cho Order 1 (Quan trọng!)
    await client.query(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, status)
      VALUES 
      ($1, $2, 1, 250000, 250000, 'served'), -- Bò
      ($1, $3, 1, 120000, 120000, 'served')  -- Mỳ Ý
    `, [order1.rows[0].id, items[1].id, items[2].id]);

    // Order 2: Đang ăn (Hôm nay)
    const order2 = await client.query(`
      INSERT INTO orders (table_id, user_id, customer_name, status, total_amount, created_at)
      VALUES ($1, $2, 'Loyal Customer', 'accepted', 140000, NOW())
      RETURNING id
    `, [tables[1].id, guestUser.id]);

    // Insert Items cho Order 2
    await client.query(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, status)
      VALUES 
      ($1, $2, 1, 85000, 85000, 'preparing'), -- Salad
      ($1, $3, 1, 55000, 55000, 'preparing')  -- Trà sữa
    `, [order2.rows[0].id, items[0].id, items[3].id]);

    // Order 3: Đã hủy (Tuần trước)
    const order3 = await client.query(`
      INSERT INTO orders (table_id, user_id, customer_name, status, total_amount, created_at)
      VALUES ($1, $2, 'Loyal Customer', 'cancelled', 0, NOW() - INTERVAL '7 DAYS')
      RETURNING id
    `, [tables[2].id, guestUser.id]);
    // Đơn hủy thường không cần items hoặc items cũng status cancelled, ta bỏ qua items để test case empty items nếu muốn, hoặc thêm vào:
    await client.query(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, status)
      VALUES ($1, $2, 2, 20000, 40000, 'cancelled')
    `, [order3.rows[0].id, items[4].id]);

    console.log("🌱 Seeded 3 History Orders for Guest (Paid, Accepted, Cancelled)");

    // Seeding thêm dữ liệu để test Report Admin
    const bulkOrders = [];
    for(let i=0; i<20; i++) {
       const res = await client.query(`
         INSERT INTO orders (table_id, customer_name, status, total_amount, paid_at, created_at)
         VALUES ($1, 'Walk-in Guest', 'paid', 200000, NOW() - INTERVAL '${i} DAY', NOW() - INTERVAL '${i} DAY')
         RETURNING id
       `, [tables[3].id]);
       // Thêm item cho report có số liệu
       await client.query(`
         INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price)
         VALUES ($1, $2, 1, 200000, 200000)
       `, [res.rows[0].id, items[1].id]);
    }
    console.log("🌱 Seeded 20 Random Orders for Admin Reports");
    
    console.log("🎉 MIGRATION & SEEDING COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();