require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  try {
    console.log('🔄 Running migration...');
    
    // Create extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    console.log('✅ Extension created');
    
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_number VARCHAR(50) NOT NULL UNIQUE,
        capacity INT NOT NULL CHECK (capacity > 0 AND capacity <= 20),
        location VARCHAR(100),
        description TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        qr_token VARCHAR(500),
        qr_token_created_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tables created');
    
    // Insert sample data
    const { rowCount } = await pool.query(`SELECT COUNT(*) as count FROM tables`);
    if (rowCount === 0) {
      await pool.query(`
        INSERT INTO tables (table_number, capacity, location, description) VALUES 
        ('T-01', 4, 'Indoor', 'Gần cửa sổ'),
        ('T-02', 2, 'Outdoor', 'Ban công'),
        ('T-03', 6, 'VIP', 'Phòng lạnh');
      `);
      console.log('✅ Sample data inserted');
    }
    
    console.log('✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
