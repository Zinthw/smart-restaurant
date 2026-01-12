-- 1. Kích hoạt extension để hỗ trợ tạo UUID (Quan trọng)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Xóa bảng cũ nếu tồn tại ....
DROP TABLE IF EXISTS item_reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_item_modifier_groups CASCADE;
DROP TABLE IF EXISTS modifier_options CASCADE;
DROP TABLE IF EXISTS modifier_groups CASCADE;
DROP TABLE IF EXISTS menu_item_photos CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS customers CASCADE; -- XÓA BỎ BẢNG NÀY
DROP TABLE IF EXISTS users CASCADE;

-- 3. Tạo bảng
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(120) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        full_name VARCHAR(100),
        phone VARCHAR(20),
        avatar_url TEXT,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'waiter', 'kitchen', 'guest')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
        
        -- Các cột phục vụ Google Login & Khách hàng
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
    
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        menu_item_id UUID REFERENCES menu_items(id),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    
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
    