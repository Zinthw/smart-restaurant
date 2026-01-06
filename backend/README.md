# 📚 Smart Restaurant Backend API Documentation

**Base URL:** `http://localhost:4000/api`
**Auth Header:** `Authorization: Bearer <TOKEN>`

---

## 🔐 1. Authentication (Auth)

| Method | Endpoint                | Description                                                     | Auth   |
| :----- | :---------------------- | :-------------------------------------------------------------- | :----- |
| `POST` | `/auth/login`           | Đăng nhập (Admin, Staff, Waiter, Kitchen). Trả về Access Token. | Public |
| `POST` | `/auth/guest/register`  | Đăng ký tài khoản cho Khách hàng.                               | Public |
| `POST` | `/auth/register`        | Admin tạo tài khoản nhân viên mới.                              | Admin  |
| `POST` | `/auth/forgot-password` | Gửi email quên mật khẩu.                                        | Public |
| `POST` | `/auth/reset-password`  | Đặt lại mật khẩu mới.                                           | Public |

---

## 🍔 2. Guest & Menu (Public)

Dành cho khách hàng quét QR Code.

| Method  | Endpoint                       | Description                                                                     |
| :------ | :----------------------------- | :------------------------------------------------------------------------------ |
| `GET`   | `/menu`                        | Lấy toàn bộ thực đơn (Categories & Items). Hỗ trợ filter `?q=`, `?categoryId=`. |
| `GET`   | `/menu/verify`                 | Kiểm tra token QR có hợp lệ không (`?token=...&tableId=...`).                   |
| `POST`  | `/orders`                      | **Tạo đơn hàng mới**. Body: `{ table_id, items: [...] }`.                       |
| `PATCH` | `/orders/:id/items`            | **Gọi thêm món** vào đơn hàng đang ăn.                                          |
| `GET`   | `/orders/:id`                  | Xem chi tiết đơn hàng (trạng thái, món ăn).                                     |
| `GET`   | `/orders/table/:tableId/order` | Lấy đơn hàng _đang phục vụ_ của bàn (để khách xem bill tạm).                    |

---

## 🤵 3. Waiter API (Phục vụ)

Dành cho ứng dụng của nhân viên phục vụ. **Yêu cầu Token (Role: Waiter/Admin)**.

| Method  | Endpoint                    | Description                                                                                  |
| :------ | :-------------------------- | :------------------------------------------------------------------------------------------- |
| `GET`   | `/waiter/orders`            | Lấy danh sách đơn hàng. Filter: `?status=pending` (đơn mới), `?status=ready` (đơn chờ bưng). |
| `PATCH` | `/waiter/orders/:id/accept` | **Xác nhận đơn**. Chuyển trạng thái `pending` -> `accepted` (Gửi xuống bếp).                 |
| `PATCH` | `/waiter/orders/:id/reject` | **Từ chối đơn**. Chuyển trạng thái sang `cancelled`.                                         |
| `PATCH` | `/waiter/orders/:id/served` | **Đã phục vụ**. Chuyển trạng thái `ready` -> `served`.                                       |

---

## 👨‍🍳 4. Kitchen API (KDS - Bếp)

Dành cho màn hình trong bếp. **Yêu cầu Token (Role: Kitchen/Admin)**.

| Method  | Endpoint                        | Description                                                                       |
| :------ | :------------------------------ | :-------------------------------------------------------------------------------- |
| `GET`   | `/kitchen/orders`               | Lấy danh sách món cần làm (Status: `accepted`, `preparing`).                      |
| `PATCH` | `/kitchen/items/:itemId/status` | Cập nhật trạng thái **từng món**. Body: `{ status: 'preparing' }` hoặc `'ready'`. |
| `PATCH` | `/kitchen/orders/:id/ready`     | Báo **cả đơn hàng** đã xong. Chuyển sang `ready`.                                 |

---

## 💳 5. Payment API (Thanh toán)

Xử lý tính tiền và thanh toán.

| Method | Endpoint                        | Description                                      | Auth   |
| :----- | :------------------------------ | :----------------------------------------------- | :----- |
| `GET`  | `/payment/tables/:tableId/bill` | Lấy hóa đơn tạm tính của bàn (Tổng tiền, Thuế).  | Public |
| `POST` | `/payment/orders/:id/pay`       | Thực hiện thanh toán (Mock). Chuyển sang `paid`. | Public |
| `GET`  | `/payment/orders/:id/receipt`   | Lấy biên lai sau khi thanh toán thành công.      | Public |

---

## 📈 6. Admin Reports (Báo cáo)

Dành cho chủ nhà hàng. **Yêu cầu Token (Role: Admin)**.

| Method | Endpoint                   | Description                                                |
| :----- | :------------------------- | :--------------------------------------------------------- |
| `GET`  | `/admin/reports/summary`   | Dashboard tổng quan (Doanh thu hôm nay, Đơn đang phục vụ). |
| `GET`  | `/admin/reports/daily`     | Biểu đồ doanh thu theo ngày. Query: `?from=...&to=...`.    |
| `GET`  | `/admin/reports/top-items` | Top 10 món bán chạy nhất.                                  |

---

## ⚡ 7. Socket.io Events (Real-time)

Hệ thống sử dụng Socket.io tại port `4000`.

### Rooms

- `table:{tableId}`: Dành cho khách ngồi tại bàn (nhận update trạng thái đơn của mình).
- `role:waiter`: Dành cho nhân viên phục vụ (nhận đơn mới, yêu cầu thanh toán).
- `role:kitchen`: Dành cho bếp (nhận món mới cần nấu).

### Events (Server emits)

1.  `order:new`: Bắn cho **Waiter** khi có khách đặt món.
2.  `order:update`: Bắn cho **Khách** khi trạng thái đơn thay đổi (Accepted, Cooking...).
3.  `order:new_task`: Bắn cho **Bếp** khi Waiter xác nhận đơn.
4.  `item:ready`: Bắn cho **Waiter** khi một món ăn đã nấu xong.
5.  `order:ready`: Bắn cho **Waiter** khi cả đơn hàng đã xong.
6.  `order:paid`: Bắn cho **Waiter/Khách** khi thanh toán thành công.
