# 🚀 Hướng Dẫn Tạo Repo Mới Với Commit History Chuyên Nghiệp

## Mục Tiêu
Tạo repository mới với lịch sử commit sạch, theo chuẩn của một team 3 người làm việc theo Agile/Scrum từ Phase 0 đến Phase cuối.

---

## 📋 Kế Hoạch Commit Tổng Quan

```
📅 Sprint 0 (Commits 1-5)   → Project setup
📅 Sprint 1 (Commits 6-15)  → Guest Ordering
📅 Sprint 2 (Commits 16-25) → Admin & KDS
📅 Sprint 3 (Commits 26-35) → Payment & Reports
📅 Sprint 4 (Commits 36-40) → Testing & Polish
📅 Sprint 5 (Commits 41-45) → Deploy & Docs
```

---

## 🛠️ Bước 1: Chuẩn Bị

### 1.1 Tạo thư mục backup
```powershell
# Backup repo hiện tại
cd F:\Web\Final_project
Copy-Item -Path .\smart-restaurant -Destination .\smart-restaurant-backup -Recurse
```

### 1.2 Tạo repo mới trên GitHub
1. Vào GitHub.com → New Repository: `smart-restaurant`
2. **KHÔNG** chọn Initialize with README
3. Tạo empty repo

### 1.3 Tạo folder mới
```powershell
mkdir F:\Web\smart-restaurant-new
cd F:\Web\smart-restaurant-new
git init
git remote add origin https://github.com/<your-username>/smart-restaurant.git
```

---

## 📝 Bước 2: Chi Tiết Từng Commit

### ═══════════════════════════════════════════
### SPRINT 0: PROJECT SETUP (Day 1-2)
### ═══════════════════════════════════════════

#### Commit 1: Initial project structure (Dev B)
```powershell
# Copy files: README.md, .gitignore, package.json (root)
git add .
git commit -m "chore: Initialize project structure"
```

#### Commit 2: Backend skeleton (Dev B)
```powershell
# Copy: backend/package.json, backend/src/index.js (basic), backend/src/db.js
git add backend/
git commit -m "feat(backend): Add Express server skeleton"
```

#### Commit 3: Database schema (Dev B)
```powershell
# Copy: backend/migrations/, backend/seeds/
git add .
git commit -m "feat(db): Add database schema and migrations"
```

#### Commit 4: Frontend skeleton (Dev C)
```powershell
# Copy: frontend/package.json, next.config, tsconfig, app/layout, app/page, styles/
git add frontend/
git commit -m "feat(frontend): Initialize NextJS project"
```

#### Commit 5: Project documentation (Dev A)
```powershell
# Copy: docs/01-initiation/, docs/02-planning/
git add docs/
git commit -m "docs: Add project documentation structure"
```

---

### ═══════════════════════════════════════════
### SPRINT 1: GUEST ORDERING (Day 3-7)
### ═══════════════════════════════════════════

#### Commit 6: Auth middleware (Dev B)
```powershell
# Copy: backend/src/middleware/auth.js, backend/src/routes/auth.js
git commit -m "feat(backend): Add JWT authentication middleware"
```

#### Commit 7: Menu API (Dev B)
```powershell
# Copy: categories.js, items.js, modifiers.js, photos.js
git commit -m "feat(backend): Add menu categories and items API"
```

#### Commit 8: Public menu API (Dev B)
```powershell
# Copy: backend/src/routes/public.js
git commit -m "feat(backend): Add public menu endpoint for guests"
```

#### Commit 9: Guest menu page (Dev A)
```powershell
# Copy: frontend/app/guest/menu/, components/guest/
git commit -m "feat(frontend): Add guest menu page with categories"
```

#### Commit 10: Menu item detail (Dev A)
```powershell
git commit -m "feat(frontend): Add menu item detail with modifiers"
```

#### Commit 11: Cart context (Dev A)
```powershell
# Copy: CartContext, cart components
git commit -m "feat(frontend): Add cart context and drawer"
```

#### Commit 12: Order API (Dev B)
```powershell
# Copy: backend/src/routes/orders.js
git commit -m "feat(backend): Add order creation and tracking API"
```

#### Commit 13: Socket.IO setup (Dev B)
```powershell
# Copy: backend/src/socket.js, update index.js
git commit -m "feat(backend): Add Socket.IO for real-time updates"
```

#### Commit 14: Order checkout (Dev A)
```powershell
git commit -m "feat(frontend): Add checkout and order submission"
```

#### Commit 15: Order status page (Dev A)
```powershell
git commit -m "feat(frontend): Add real-time order status tracking"
```

---

### ═══════════════════════════════════════════
### SPRINT 2: ADMIN & KDS (Day 8-12)
### ═══════════════════════════════════════════

#### Commit 16-17: Admin login & layout (Dev C)
```powershell
git commit -m "feat(frontend): Add admin login page"
git commit -m "feat(frontend): Add admin dashboard layout with sidebar"
```

#### Commit 18-19: Admin dashboard & menu (Dev C)
```powershell
git commit -m "feat(frontend): Add admin dashboard with stats"
git commit -m "feat(frontend): Add menu management CRUD"
```

#### Commit 20-21: Table & QR (Dev B + Dev C)
```powershell
git commit -m "feat(backend): Add table management and QR generation API"
git commit -m "feat(frontend): Add table management with QR codes"
```

#### Commit 22-25: KDS & Waiter (Dev B + Dev C)
```powershell
git commit -m "feat(backend): Add kitchen display system API"
git commit -m "feat(backend): Add waiter order management API"
git commit -m "feat(frontend): Add Kitchen Display System with real-time"
git commit -m "feat(frontend): Add waiter order management"
```

---

### ═══════════════════════════════════════════
### SPRINT 3: PAYMENT & REPORTS (Day 13-16)
### ═══════════════════════════════════════════

#### Commit 26-30: Payment & Reports (Dev A, B, C)
```powershell
git commit -m "feat(backend): Add payment and billing API"
git commit -m "feat(frontend): Add payment page with Stripe integration"
git commit -m "feat(backend): Add revenue and analytics API"
git commit -m "feat(frontend): Add reports dashboard with charts"
git commit -m "feat(backend): Add menu item reviews API"
```

---

### ═══════════════════════════════════════════
### SPRINT 4 & 5: POLISH & DEPLOY (Day 17-20)
### ═══════════════════════════════════════════

#### Commit 31-35: Additional features
```powershell
git commit -m "feat(backend): Add customer profile API"
git commit -m "feat(backend): Add staff user management"
git commit -m "fix(frontend): Fix cart and order status bugs"
git commit -m "fix(frontend): Fix KDS and reports rendering issues"
git commit -m "style(frontend): Improve mobile responsiveness"
```

#### Commit 36-40: Documentation
```powershell
git commit -m "docs: Add sprint retrospectives and burndown"
git commit -m "chore: Add deployment configuration"
git commit -m "docs: Add demo script and deployment checklist"
git commit -m "docs: Add API documentation"
git commit -m "docs: Update README with project overview"
```

---

## 🔧 Script Thay Đổi Author

```powershell
# Set author cho commits khác nhau
git config user.name "Dev B Name"
git config user.email "devb@example.com"
git commit -m "message"

# Đổi về author mặc định
git config user.name "Dev A Name"
git config user.email "deva@example.com"
```

---

## 📅 Fake Commit Dates

```powershell
# PowerShell - Set date trước khi commit
$env:GIT_AUTHOR_DATE = "2026-01-03T09:00:00"
$env:GIT_COMMITTER_DATE = "2026-01-03T09:00:00"
git commit -m "message"

# Reset
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE
```

---

## ✅ Checklist Cuối Cùng

- [ ] Tổng ~40 commits
- [ ] 3 authors khác nhau (Dev A ~14, Dev B ~14, Dev C ~12)
- [ ] Dates từ 03/01 - 22/01
- [ ] Test repo clone về chạy được
- [ ] Push to GitHub
