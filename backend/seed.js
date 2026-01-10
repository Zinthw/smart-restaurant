// seed.js - Smart Restaurant Database Seeder
require('dotenv').config();
const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

// --- CẤU HÌNH DATABASE ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'smart_restaurant'}`,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// --- DỮ LIỆU MẪU THỰC TẾ VỚI ẢNH ĐẸP ---
const CATEGORIES_DATA = [
    { 
        name: 'Khai vị', 
        description: 'Các món khai vị ngon miệng để bắt đầu bữa ăn',
        img: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80',
        items: [
            { name: 'Gỏi cuốn tôm thịt', description: 'Gỏi cuốn tươi ngon với tôm, thịt, bún, rau thơm và nước chấm đậm đà', price: 45000, img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80', prepTime: 10 },
            { name: 'Chả giò giòn', description: 'Chả giò chiên vàng giòn với nhân thịt heo, mộc nhĩ, miến', price: 50000, img: 'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?auto=format&fit=crop&w=800&q=80', prepTime: 15 },
            { name: 'Salad trộn dầu giấm', description: 'Salad rau củ tươi mát với sốt dầu giấm đặc biệt', price: 55000, img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80', prepTime: 8 },
            { name: 'Súp hải sản', description: 'Súp hải sản đậm đà với tôm, mực, nghêu', price: 65000, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', prepTime: 12 },
            { name: 'Nem nướng Nha Trang', description: 'Nem nướng thơm ngon đặc sản Nha Trang', price: 60000, img: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&w=800&q=80', prepTime: 10 },
            { name: 'Gỏi ngó sen tôm thịt', description: 'Gỏi ngó sen giòn tan với tôm tươi và thịt heo', price: 70000, img: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=800&q=80', prepTime: 12 },
            { name: 'Cánh gà chiên nước mắm', description: 'Cánh gà chiên giòn sốt nước mắm đường đặc biệt', price: 75000, img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', prepTime: 18 },
            { name: 'Đậu hũ chiên giòn', description: 'Đậu hũ chiên vàng giòn, ăn kèm nước chấm chua ngọt', price: 35000, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', prepTime: 10 }
        ]
    },
    { 
        name: 'Món chính', 
        description: 'Các món chính phong phú từ Á đến Âu',
        img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        items: [
            { name: 'Phở bò Hà Nội', description: 'Phở bò truyền thống với nước dùng ninh từ xương 12 tiếng', price: 65000, img: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=800&q=80', prepTime: 15 },
            { name: 'Bún chả Hà Nội', description: 'Bún chả thơm ngon với thịt nướng than hoa, chả chiên', price: 60000, img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80', prepTime: 20 },
            { name: 'Cơm gà Hội An', description: 'Cơm gà vàng ươm đặc sản Hội An, ăn kèm rau sống', price: 70000, img: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?auto=format&fit=crop&w=800&q=80', prepTime: 18 },
            { name: 'Mì Quảng tôm thịt', description: 'Mì Quảng đặc sản Quảng Nam với tôm tươi, thịt heo', price: 75000, img: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80', prepTime: 20 },
            { name: 'Cá hồi nướng sốt teriyaki', description: 'Cá hồi Na Uy nướng chín tới với sốt teriyaki đặc biệt', price: 180000, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80', prepTime: 25 },
            { name: 'Bò bít tết Úc', description: 'Bò Úc nhập khẩu 200g nướng chín vừa, kèm khoai tây chiên', price: 220000, img: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=80', prepTime: 22 },
            { name: 'Sườn nướng BBQ Hàn Quốc', description: 'Sườn heo nướng kiểu Hàn Quốc, ướp gia vị đặc biệt', price: 150000, img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80', prepTime: 30 },
            { name: 'Gà nướng mật ong', description: 'Gà ta nướng thơm lừng với mật ong nguyên chất', price: 120000, img: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80', prepTime: 35 },
            { name: 'Pizza hải sản cao cấp', description: 'Pizza Ý với tôm, mực, cá ngừ và phô mai Mozzarella', price: 160000, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', prepTime: 20 },
            { name: 'Spaghetti hải sản', description: 'Mì Ý sốt cà chua với hải sản tươi ngon', price: 140000, img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80', prepTime: 18 },
            { name: 'Lẩu Thái hải sản', description: 'Lẩu Thái chua cay đậm đà với hải sản tươi sống', price: 280000, img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', prepTime: 25 },
            { name: 'Cơm chiên Dương Châu', description: 'Cơm chiên kiểu Hồng Kông với tôm, xúc xích, rau củ', price: 80000, img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', prepTime: 15 }
        ]
    },
    { 
        name: 'Đồ uống', 
        description: 'Thức uống tươi mát và thơm ngon',
        img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
        items: [
            { name: 'Trà sữa trân châu đường đen', description: 'Trà sữa Đài Loan với trân châu đường đen thơm ngon', price: 45000, img: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80', prepTime: 8 },
            { name: 'Cà phê sữa đá Việt Nam', description: 'Cà phê phin truyền thống pha với sữa đặc', price: 35000, img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', prepTime: 10 },
            { name: 'Sinh tố bơ', description: 'Sinh tố bơ sánh mịn, béo ngậy', price: 40000, img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
            { name: 'Nước ép cam tươi', description: 'Nước cam vắt tươi 100% không đường', price: 35000, img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
            { name: 'Trà đào cam sả', description: 'Trà hoa quả tươi mát với đào, cam, sả thơm', price: 48000, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80', prepTime: 8 },
            { name: 'Mojito bạc hà', description: 'Cocktail không cồn với bạc hà, chanh tươi', price: 55000, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', prepTime: 7 },
            { name: 'Soda blue curacao', description: 'Soda xanh mát lạnh với vị bạc hà nhẹ', price: 42000, img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
            { name: 'Matcha latte đá xay', description: 'Matcha Nhật Bản xay với sữa tươi', price: 52000, img: 'https://images.unsplash.com/photo-1536013028687-2f1c9b7ec05f?auto=format&fit=crop&w=800&q=80', prepTime: 8 }
        ]
    },
    { 
        name: 'Tráng miệng', 
        description: 'Các món tráng miệng ngọt ngào',
        img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
        items: [
            { name: 'Tiramisu Ý', description: 'Bánh Tiramisu truyền thống với cà phê Espresso và Mascarpone', price: 65000, img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
            { name: 'Panna Cotta dâu tây', description: 'Pudding Ý mềm mịn với sốt dâu tây tươi', price: 58000, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
            { name: 'Chè Thái đặc biệt', description: 'Chè Thái 7 màu với dừa tươi, thạch, đậu', price: 45000, img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', prepTime: 8 },
            { name: 'Bánh Flan caramel', description: 'Bánh Flan mềm mịn với caramel đắng nhẹ', price: 35000, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
            { name: 'Kem tươi ba màu', description: 'Kem tươi vanilla, chocolate, dâu tây', price: 48000, img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
            { name: 'Sương sáo hạt lựu', description: 'Sương sáo mát lạnh với hạt lựu, nước đường', price: 30000, img: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
            { name: 'Bánh Mousse chocolate', description: 'Bánh Mousse chocolate Bỉ nhập khẩu', price: 70000, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', prepTime: 5 },
            { name: 'Yaourt Hy Lạp mật ong hạnh nhân', description: 'Yaourt Hy Lạp nguyên chất với mật ong và hạnh nhân', price: 55000, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80', prepTime: 5 }
        ]
    },
    { 
        name: 'Món ăn nhanh', 
        description: 'Các món ăn nhanh tiện lợi',
        img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        items: [
            { name: 'Burger bò phô mai', description: 'Burger bò Úc 150g với phô mai cheddar, rau xà lách, cà chua', price: 85000, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', prepTime: 12 },
            { name: 'Bánh mì thịt nguội', description: 'Bánh mì Việt Nam với thịt nguội, pate, rau thơm', price: 35000, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', prepTime: 8 },
            { name: 'Sandwich gà', description: 'Sandwich với gà nướng, rau củ tươi', price: 55000, img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', prepTime: 10 },
            { name: 'Khoai tây chiên', description: 'Khoai tây chiên giòn, ăn kèm tương cà', price: 40000, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80', prepTime: 10 },
            { name: 'Gà rán KFC style', description: 'Gà rán giòn tan kiểu Hàn Quốc', price: 95000, img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', prepTime: 15 },
            { name: 'Hot dog xúc xích Đức', description: 'Hot dog với xúc xích Đức, bánh mì nướng', price: 48000, img: 'https://images.unsplash.com/photo-1612392062422-ef19b42f74df?auto=format&fit=crop&w=800&q=80', prepTime: 8 }
        ]
    }
];

const seed = async () => {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Bắt đầu quá trình Seed Data...');
        await client.query('BEGIN');

        // 1. DỌN DẸP DỮ LIỆU CŨ (Thứ tự xóa quan trọng vì khóa ngoại)
        console.log('🧹 Đang dọn dẹp DB...');
        
        // Kiểm tra xem có bảng nào tồn tại không
        const tableCheck = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);
        
        if (tableCheck.rows.length > 0) {
            await client.query(`
                TRUNCATE TABLE order_items, orders, menu_item_modifier_groups, modifier_options, 
                modifier_groups, menu_item_photos, menu_items, menu_categories, tables, users 
                CASCADE
            `);
            console.log('   ✓ Đã xóa dữ liệu cũ');
        } else {
            console.log('   ℹ Database rỗng, bỏ qua bước xóa');
        }

        // 2. TẠO USERS
        console.log('👤 Đang tạo Users...');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('123456', salt); // Pass chung: 123456

        // Admin
        await client.query(
            `INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, $4)`,
            ['admin@restaurant.com', hash, 'admin', 'active']
        );

        // Waiter (5 người)
        for (let i = 1; i <= 5; i++) {
            await client.query(
                `INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, $4)`,
                [`waiter${i}@res.com`, hash, 'waiter', 'active']
            );
        }

        // Kitchen Staff (3 người)
        for (let i = 1; i <= 3; i++) {
            await client.query(
                `INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, $4)`,
                [`kitchen${i}@res.com`, hash, 'kitchen', 'active']
            );
        }

        // Guest (Khách hàng thành viên - 20 người)
        // const guestIds = [];
        // for (let i = 1; i <= 20; i++) {
        //     const res = await client.query(
        //         `INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, $4) RETURNING id`,
        //         [`guest${i}@gmail.com`, hash, 'guest', 'active']
        //     );
        //     guestIds.push(res.rows[0].id);
        // }

        // 3. TẠO TABLES (BÀN ĂN - 25 bàn)
        console.log('🪑 Đang tạo Bàn ăn...');
        const tableIds = [];
        const locations = ['Tầng 1 - Khu A', 'Tầng 1 - Khu B', 'Tầng 2 - Khu VIP', 'Tầng 2 - Ban công', 'Tầng 3 - Rooftop'];
        const capacities = [2, 4, 6, 8];
        
        for (let i = 1; i <= 25; i++) {
            const num = i < 10 ? `0${i}` : i;
            const capacity = capacities[Math.floor(Math.random() * capacities.length)];
            const location = locations[Math.floor(i / 6) % locations.length];
            const description = capacity >= 6 ? 'Phù hợp gia đình, nhóm bạn' : 'Phù hợp 2-4 người';
            
            const res = await client.query(`
                INSERT INTO tables (table_number, capacity, location, description, qr_token, qr_token_created_at, status)
                VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING id`,
                [`T-${num}`, capacity, location, description, `QR_TOKEN_TABLE_${num}_${Date.now()}`, 'active']
            );
            tableIds.push(res.rows[0].id);
        }

        // 4. TẠO MODIFIER GROUPS (Topping, Size...)
        console.log('⚙️ Đang tạo Modifiers...');
        // Group Size
        const sizeGroupRes = await client.query(`
            INSERT INTO modifier_groups (name, selection_type, min_selection, max_selection)
            VALUES ('Size', 'single', 1, 1) RETURNING id
        `);
        const sizeGroupId = sizeGroupRes.rows[0].id;
        
        await client.query(`
            INSERT INTO modifier_options (group_id, name, price_adjustment) VALUES 
            ($1, 'Size M', 0),
            ($1, 'Size L', 10000)
        `, [sizeGroupId]);

        // Group Topping
        const toppingGroupRes = await client.query(`
            INSERT INTO modifier_groups (name, selection_type, min_selection, max_selection)
            VALUES ('Topping thêm', 'multiple', 0, 5) RETURNING id
        `);
        const toppingGroupId = toppingGroupRes.rows[0].id;

        await client.query(`
            INSERT INTO modifier_options (group_id, name, price_adjustment) VALUES 
            ($1, 'Thêm phô mai', 15000),
            ($1, 'Thêm trân châu', 5000),
            ($1, 'Thêm sốt', 5000)
        `, [toppingGroupId]);

        // 5. TẠO CATEGORIES & MENU ITEMS (DỮ LIỆU THỰC TẾ)
        console.log('🍔 Đang tạo Menu & Ảnh...');
        const menuItemIds = [];
        const itemStatuses = ['available', 'available', 'available', 'available', 'sold_out', 'hidden'];

        for (const catData of CATEGORIES_DATA) {
            const catRes = await client.query(
                `INSERT INTO menu_categories (name, description, image_url, sort_order, status) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [catData.name, catData.description, catData.img, CATEGORIES_DATA.indexOf(catData), 'active']
            );
            const catId = catRes.rows[0].id;

            // Tạo món theo dữ liệu thực tế
            for (const itemData of catData.items) {
                const status = itemStatuses[Math.floor(Math.random() * itemStatuses.length)];
                const isChefRecommended = Math.random() > 0.75; // 25% món được chef recommend
                
                const itemRes = await client.query(`
                    INSERT INTO menu_items (category_id, name, description, price, prep_time_minutes, is_chef_recommended, status, order_count)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                    [
                        catId,
                        itemData.name,
                        itemData.description,
                        itemData.price,
                        itemData.prepTime,
                        isChefRecommended,
                        status,
                        0 // Sẽ update sau khi tạo orders
                    ]
                );
                const itemId = itemRes.rows[0].id;
                menuItemIds.push(itemId);

                // Thêm ảnh primary cho món
                await client.query(`
                    INSERT INTO menu_item_photos (menu_item_id, photo_url, is_primary)
                    VALUES ($1, $2, true)`,
                    [itemId, itemData.img]
                );

                // Thêm 1-2 ảnh phụ cho một số món (30% món có nhiều ảnh)
                if (Math.random() > 0.7) {
                    const extraImages = [
                        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
                    ];
                    for (let e = 0; e < Math.min(2, Math.floor(Math.random() * 2) + 1); e++) {
                        await client.query(`
                            INSERT INTO menu_item_photos (menu_item_id, photo_url, is_primary)
                            VALUES ($1, $2, false)`,
                            [itemId, extraImages[e]]
                        );
                    }
                }

                // Link món ăn với Modifier Groups (chỉ cho món uống và món ăn nhanh)
                if (catData.name === 'Đồ uống' || catData.name === 'Món ăn nhanh' || catData.name === 'Món chính') {
                    await client.query(`
                        INSERT INTO menu_item_modifier_groups (menu_item_id, modifier_group_id, sort_order)
                        VALUES ($1, $2, 0), ($1, $3, 1)`,
                        [itemId, sizeGroupId, toppingGroupId]
                    );
                }
            }
        }

        // 6. TẠO ORDERS (Đơn hàng giả - 50 orders)
        console.log('🧾 Đang tạo Orders với dữ liệu chi tiết...');
        const statuses = ['pending', 'accepted', 'preparing', 'ready', 'served', 'paid', 'cancelled'];
        const statusWeights = [0.1, 0.15, 0.2, 0.15, 0.1, 0.25, 0.05]; // Tỷ lệ mỗi status

        for (let i = 0; i < 50; i++) {
            const randTable = tableIds[Math.floor(Math.random() * tableIds.length)];
            // Weighted random status
            const rand = Math.random();
            let cumulative = 0;
            let status = 'pending';
            for (let s = 0; s < statuses.length; s++) {
                cumulative += statusWeights[s];
                if (rand <= cumulative) {
                    status = statuses[s];
                    break;
                }
            }
            const customerName = faker.person.fullName();
            const customerPhone = `09${Math.floor(Math.random() * 100000000)}`;
            
            // Tạo Order Header
            const orderRes = await client.query(`
                INSERT INTO orders (table_id, customer_name, customer_phone, status, total_amount, notes, paid_at)
                VALUES ($1, $2, $3, $4, 0, $5, $6) RETURNING id`,
                [
                    randTable, 
                    customerName,
                    customerPhone,
                    status,
                    Math.random() > 0.7 ? faker.lorem.sentence() : null, // 30% có ghi chú
                    status === 'paid' ? new Date() : null
                ]
            );
            const orderId = orderRes.rows[0].id;

            // Tạo Order Items
            let totalOrderAmount = 0;
            const itemCount = Math.floor(Math.random() * 4) + 1; // 1-4 món

            for (let j = 0; j < itemCount; j++) {
                const randItem = menuItemIds[Math.floor(Math.random() * menuItemIds.length)];
                
                // --- 1. THÊM ĐOẠN LẤY GIÁ NÀY VÀO ---
                const priceRes = await client.query('SELECT price FROM menu_items WHERE id = $1', [randItem]);
                const basePrice = parseFloat(priceRes.rows[0].price);
                // ------------------------------------

                const qty = Math.floor(Math.random() * 3) + 1;
                
                // Random modifiers với giá thực tế
                const modifiersPrice = Math.random() > 0.5 ? 15000 : 0;
                
                // Giờ có basePrice rồi thì dòng này mới chạy được
                const totalItemPrice = (basePrice + modifiersPrice) * qty;

                // Fake JSON modifiers (Để hiển thị cho đẹp)
                const fakeModifiers = modifiersPrice > 0 ? [
                    { name: 'Size L', price: 10000 },
                    { name: 'Thêm phô mai', price: 5000 }
                ] : [
                    { name: 'Size M', price: 0 }
                ];

                // Random item status based on order status
                let itemStatus = 'pending';
                if (status === 'preparing' || status === 'ready') itemStatus = 'preparing';
                if (status === 'ready' || status === 'served') itemStatus = 'ready';
                if (status === 'served' || status === 'paid') itemStatus = 'completed';
                if (status === 'cancelled') itemStatus = 'cancelled';

                await client.query(`
                    INSERT INTO order_items (order_id, menu_item_id, quantity, price_per_unit, total_price, modifiers_selected, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [orderId, randItem, qty, basePrice, totalItemPrice, JSON.stringify(fakeModifiers), itemStatus]
                );

                totalOrderAmount += totalItemPrice;
            }

            // Cập nhật tổng tiền cho order
            await client.query(`
                UPDATE orders SET total_amount = $1 WHERE id = $2
            `, [totalOrderAmount, orderId]);
        }

        // 8. CẬP NHẬT ORDER_COUNT CHO CÁC MÓN PHỔ BIẾN
        console.log('📊 Đang cập nhật thống kê món ăn...');
        await client.query(`
            UPDATE menu_items 
            SET order_count = (
                SELECT COALESCE(SUM(oi.quantity), 0)
                FROM order_items oi
                WHERE oi.menu_item_id = menu_items.id
            )
        `);

        await client.query('COMMIT');
        console.log('');
        console.log('✅ ═══════════════════════════════════════════════════');
        console.log('✅  SEED DATA HOÀN TẤT! RESTAURANT SYSTEM SẴN SÀNG  ');
        console.log('✅ ═══════════════════════════════════════════════════');
        console.log('');
        console.log('📋 THÔNG TIN ĐĂNG NHẬP:');
        console.log('   👑 Admin:   admin@restaurant.com / 123456');
        console.log('   🧑‍💼 Waiter:  waiter1@res.com / 123456');
        console.log('   👨‍🍳 Kitchen: kitchen1@res.com / 123456');
        console.log('   👤 Guest:   guest1@gmail.com / 123456');
        console.log('');
        console.log('📊 DỮ LIỆU ĐÃ TẠO:');
        const stats = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users,
                (SELECT COUNT(*) FROM tables) as tables,
                (SELECT COUNT(*) FROM menu_categories) as categories,
                (SELECT COUNT(*) FROM menu_items) as menu_items,
                (SELECT COUNT(*) FROM menu_item_photos) as photos,
                (SELECT COUNT(*) FROM modifier_groups) as modifier_groups,
                (SELECT COUNT(*) FROM orders) as orders,
                (SELECT COUNT(*) FROM orders WHERE status = 'paid') as paid_orders,
                (SELECT COUNT(*) FROM orders WHERE status != 'paid') as active_orders,
                (SELECT COUNT(*) FROM order_items) as order_items,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'paid') as total_revenue
        `);
        const s = stats.rows[0];
        console.log(`   • ${s.users} Users (1 Admin + 5 Waiters + 3 Kitchen + ${parseInt(s.users) - 9} Guests)`);
        console.log(`   • ${s.tables} Tables với QR codes unique`);
        console.log(`   • ${s.categories} Categories`);
        console.log(`   • ${s.menu_items} Menu Items với descriptions`);
        console.log(`   • ${s.photos} Photos (mỗi món có ảnh)`);
        console.log(`   • ${s.modifier_groups} Modifier Groups`);
        console.log(`   • ${s.orders} Orders (${s.paid_orders} paid + ${s.active_orders} active)`);
        console.log(`   • ${s.order_items} Order Items`);
        console.log(`   • ${parseFloat(s.total_revenue).toLocaleString('vi-VN')}đ Total Revenue`);
        console.log('');
        console.log('🎯 DEMO SCENARIOS SẴN SÀNG:');
        console.log('   ✓ Orders ở tất cả trạng thái: pending → accepted → preparing → ready → served → paid');
        console.log('   ✓ Historical data 30 ngày cho Reports & Analytics');
        console.log('   ✓ Menu đa dạng với modifiers');
        console.log('   ✓ Tables với locations và capacities khác nhau');
        console.log('');
        console.log('🚀 Bắt đầu server backend và truy cập ứng dụng!');
        console.log('   Backend: npm start (trong folder backend)');
        console.log('   Frontend: npm run dev (trong folder frontend)');
        console.log('═══════════════════════════════════════════════════');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('');
        console.error('❌ ═══════════════════════════════════════════════════');
        console.error('❌  LỖI KHI SEED DATABASE');
        console.error('❌ ═══════════════════════════════════════════════════');
        console.error('');
        console.error('Chi tiết lỗi:', e.message);
        console.error('Stack:', e.stack);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Chạy seed với error handling
seed().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});