# Demo Script - Smart Restaurant

## Demo Information

| Item | Value |
|------|-------|
| **Duration** | 5-10 minutes |
| **Presenter** | Dev A (Team Lead) |
| **Support** | Dev B, Dev C |
| **Date** | 22/01/2026 |

---

## Pre-Demo Checklist

### Technical Setup
- [ ] Chrome browser (incognito mode)
- [ ] Mobile phone với 4G/WiFi
- [ ] Backend running on production URL
- [ ] Frontend running on production URL
- [ ] Test data seeded
- [ ] QR code printed/displayed

### Accounts Ready
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@restaurant.com | Admin123! |
| Waiter | waiter@restaurant.com | Waiter123! |
| Kitchen | kitchen@restaurant.com | Kitchen123! |

### Test Data
- [x] 5 menu categories
- [x] 10+ menu items with images
- [x] 5 tables with QR codes
- [x] Sample modifiers

---

## Demo Flow

### Opening (30 seconds)
> "Xin chào thầy/cô. Hôm nay nhóm chúng em sẽ demo Smart Restaurant - hệ thống đặt món qua QR code cho nhà hàng."

> "Hệ thống này giúp:
> - Khách hàng đặt món nhanh chóng qua điện thoại
> - Nhà bếp nhận order real-time
> - Quản lý theo dõi doanh thu"

---

### Part 1: Customer Journey (3 minutes)

#### 1.1 Scan QR Code
> "Đầu tiên, khách vào nhà hàng và ngồi bàn số 5. Khách scan QR code trên bàn."

**Action:** 
- Show QR code for Table 5
- Scan với điện thoại
- Menu loads automatically

> "Menu hiển thị ngay lập tức với table ID tự động nhận diện."

#### 1.2 Browse Menu
> "Khách có thể xem menu theo category."

**Action:**
- Click different categories (Appetizers, Main Dishes, Drinks)
- Search for "salmon"
- Show item details

> "Mỗi món có hình ảnh, mô tả, giá và thời gian chuẩn bị dự kiến."

#### 1.3 Add to Cart
> "Khách chọn món và tùy chỉnh theo ý thích."

**Action:**
- Click "Grilled Salmon"
- Select size: Large (+$5)
- Add extra: Side salad (+$4)
- Add note: "No onions"
- Quantity: 2
- Add to cart

> "Giá tự động cập nhật theo modifiers."

#### 1.4 Submit Order
> "Khách xem lại giỏ hàng và đặt order."

**Action:**
- Open cart
- Review items
- Click "Place Order"
- Show confirmation

> "Order được gửi đến hệ thống và khách có thể xem trạng thái real-time."

---

### Part 2: Kitchen & Waiter Flow (2 minutes)

#### 2.1 Waiter Receives Order
> "Phía waiter nhận được thông báo có order mới."

**Action:**
- Switch to Waiter screen (laptop)
- Show new order notification
- Click Accept

> "Waiter có thể accept hoặc reject order. Sau khi accept, order được gửi xuống bếp."

#### 2.2 Kitchen Display System (KDS)
> "Trong bếp, đầu bếp thấy order trên Kitchen Display System."

**Action:**
- Show KDS screen
- Point out timer
- Click "Start Preparing"
- Show customer screen updates to "Preparing"

> "Khách thấy trạng thái thay đổi real-time trên điện thoại."

#### 2.3 Order Ready
**Action:**
- Click "Ready" on KDS
- Customer sees "Ready" status
- Waiter clicks "Served"
- Customer sees "Served"

> "Toàn bộ flow tracking từ đặt món đến nhận món đều real-time."

---

### Part 3: Admin Features (2 minutes)

#### 3.1 Admin Dashboard
> "Admin đăng nhập để quản lý nhà hàng."

**Action:**
- Login as admin
- Show Dashboard with stats

> "Dashboard hiển thị doanh thu hôm nay, số order, và trạng thái realtime."

#### 3.2 Menu Management
> "Admin có thể quản lý menu."

**Action:**
- Go to Menu page
- Show adding new item (briefly)
- Show categories

> "Thêm, sửa, xóa món và quản lý category."

#### 3.3 Table & QR Management
> "Quản lý bàn và generate QR code."

**Action:**
- Show Tables page
- Click download QR
- Show regenerate option

> "Mỗi bàn có QR code riêng, có thể regenerate để invalid code cũ."

#### 3.4 Reports
> "Cuối cùng là báo cáo doanh thu."

**Action:**
- Go to Reports
- Show daily revenue chart
- Show top-selling items

> "Admin thấy được revenue theo ngày và các món bán chạy nhất."

---

### Part 4: Payment (1 minute)

#### 4.1 Request Bill
> "Khi khách ăn xong, request bill."

**Action:**
- On customer phone, click "Request Bill"
- Show bill summary

> "Bill hiển thị tất cả món đã order trong phiên bàn."

#### 4.2 Payment
> "Khách thanh toán qua thẻ."

**Action:**
- Show payment form
- Enter test card: 4242 4242 4242 4242
- Click Pay
- Show success

> "Sau khi thanh toán, bàn được reset và sẵn sàng cho khách mới."

---

### Closing (30 seconds)

> "Đó là toàn bộ demo Smart Restaurant.
> 
> **Công nghệ sử dụng:**
> - Frontend: NextJS + React
> - Backend: NodeJS + Express + Socket.IO
> - Database: PostgreSQL
> - Payment: Stripe
> 
> **Cảm ơn thầy/cô đã lắng nghe. Nhóm sẵn sàng trả lời câu hỏi.**"

---

## Fallback Plans

| Problem | Solution |
|---------|----------|
| QR scan fails | Enter URL manually |
| Socket disconnects | Refresh page, fallback to polling |
| Payment fails | Show "Pay at counter" option |
| Production down | Demo on localhost |
| Mobile fails | Use Chrome DevTools responsive mode |

---

## Q&A Preparation

### Expected Questions

1. **"Làm sao xử lý khi mất kết nối?"**
   > Socket.IO tự reconnect. Nếu không được, có fallback polling. Order đã submit an toàn trong database.

2. **"Security như thế nào?"**
   > JWT authentication, role-based access. QR code có token ngắn hạn. Payment qua Stripe.

3. **"Có thể scale không?"**
   > Có, frontend trên Vercel tự scale. Backend có thể horizontal scale. Database dùng connection pooling.

4. **"Tại sao chọn Socket.IO?"**
   > Real-time updates crucial cho KDS. Socket.IO có fallback và reconnection tự động.

---

*Document Version: 1.0 | Last Updated: 21/01/2026*
