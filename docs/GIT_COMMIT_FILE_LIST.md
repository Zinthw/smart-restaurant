# 📁 Chi Tiết Files Cho Mỗi Commit - Smart Restaurant

> **Tổng quan project:**
> - Backend: 17 routes, 5 middleware, migrations & seeds
> - Frontend: 57 UI components, ~30 pages
> - Docs: 20 files trong 5 phases

---

## 🛠️ SPRINT 0: PROJECT SETUP (Commits 1-5)

### ═══════════════════════════════════════════════════════
### COMMIT 1: Initial project structure
**Author:** Dev B  
**Message:** `chore: Initialize project structure`  
**Date:** 03/01/2026

```
📁 Files to add:
├── .gitignore                    (tạo mới)
├── package.json                  (root - copy từ smart-restaurant/)
└── README.md                     (viết mới, ngắn gọn)
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 2: Backend Express skeleton
**Author:** Dev B  
**Message:** `feat(backend): Add Express server skeleton`  
**Date:** 03/01/2026

```
📁 Files to add:
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js              (basic version - chỉ express setup)
│       └── db.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 3: Database schema
**Author:** Dev B  
**Message:** `feat(db): Add database schema and migrations`  
**Date:** 04/01/2026

```
📁 Files to add:
├── backend/
│   ├── database.sql
│   ├── migrate.js
│   ├── seed.js
│   └── seed-customer-orders.js   (optional)
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 4: Frontend NextJS skeleton
**Author:** Dev C  
**Message:** `feat(frontend): Initialize NextJS project`  
**Date:** 04/01/2026

```
📁 Files to add:
├── frontend/
│   ├── package.json
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── .gitignore
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── styles/                   (folder nếu có)
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 5: Project documentation
**Author:** Dev A  
**Message:** `docs: Add project documentation structure`  
**Date:** 04/01/2026

```
📁 Files to add:
├── docs/
│   ├── 01-initiation/
│   │   ├── PROJECT_CHARTER.md
│   │   ├── TEAM_ORGANIZATION.md
│   │   └── COMMUNICATION_PLAN.md
│   └── 02-planning/
│       ├── WORK_BREAKDOWN_STRUCTURE.md
│       ├── SPRINT_PLANNING.md
│       ├── RISK_REGISTER.md
│       └── DEFINITION_OF_DONE.md
```

---

## 🍽️ SPRINT 1: GUEST ORDERING (Commits 6-15)

### ═══════════════════════════════════════════════════════
### COMMIT 6: Authentication middleware
**Author:** Dev B  
**Message:** `feat(backend): Add JWT authentication middleware`  
**Date:** 05/01/2026

```
📁 Files to add:
├── backend/src/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   ├── uploadMiddleware.js
│   │   └── validators.js
│   └── utils/
│       └── sendEmail.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 7: Auth routes
**Author:** Dev B  
**Message:** `feat(backend): Add authentication routes`  
**Date:** 05/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   └── auth.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 8: Menu API (Categories, Items, Modifiers)
**Author:** Dev B  
**Message:** `feat(backend): Add menu categories and items API`  
**Date:** 06/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   ├── categories.js
│   ├── items.js
│   ├── modifiers.js
│   └── photos.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 9: Public menu API
**Author:** Dev B  
**Message:** `feat(backend): Add public menu endpoint for guests`  
**Date:** 06/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   └── public.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 10: UI Components
**Author:** Dev C  
**Message:** `feat(frontend): Add UI component library`  
**Date:** 07/01/2026

```
📁 Files to add:
├── frontend/
│   ├── lib/
│   │   └── utils.ts
│   ├── components.json
│   └── components/ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       ├── table.tsx
│       ├── badge.tsx
│       ├── drawer.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── use-toast.ts
│       ├── skeleton.tsx
│       ├── spinner.tsx
│       ├── separator.tsx
│       └── (các ui components còn lại - tổng 57 files)
```

> **Note:** Có thể chia commit này thành 2-3 commits nhỏ hơn

---

### ═══════════════════════════════════════════════════════
### COMMIT 11: Guest Menu components
**Author:** Dev A  
**Message:** `feat(frontend): Add guest menu components`  
**Date:** 07/01/2026

```
📁 Files to add:
├── frontend/components/guest/
│   ├── menu-header.tsx
│   ├── category-tabs.tsx
│   ├── menu-item-card.tsx
│   ├── item-detail-modal.tsx
│   └── bottom-navigation.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 12: Guest Menu page
**Author:** Dev A  
**Message:** `feat(frontend): Add guest menu page with categories`  
**Date:** 07/01/2026

```
📁 Files to add:
├── frontend/app/menu/
│   ├── page.tsx
│   └── guest/
│       └── (files in folder)
├── frontend/lib/
│   ├── api.ts
│   └── menu-data.ts
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 13: Cart context and drawer
**Author:** Dev A  
**Message:** `feat(frontend): Add cart context and drawer`  
**Date:** 08/01/2026

```
📁 Files to add:
├── frontend/
│   ├── lib/
│   │   └── cart-context.tsx
│   └── components/guest/
│       └── cart-drawer.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 14: Orders API
**Author:** Dev B  
**Message:** `feat(backend): Add order creation and tracking API`  
**Date:** 08/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   └── orders.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 15: Socket.IO real-time
**Author:** Dev B  
**Message:** `feat(backend): Add Socket.IO for real-time updates`  
**Date:** 09/01/2026

```
📁 Files to add:
├── backend/src/
│   └── socket.js

📁 Files to update:
├── backend/src/index.js          (thêm socket integration)
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 16: Guest checkout page
**Author:** Dev A  
**Message:** `feat(frontend): Add checkout and order submission`  
**Date:** 09/01/2026

```
📁 Files to add:
├── frontend/app/guest/
│   └── checkout/
│       └── page.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 17: Guest order tracking
**Author:** Dev A  
**Message:** `feat(frontend): Add real-time order status tracking`  
**Date:** 09/01/2026

```
📁 Files to add:
├── frontend/app/guest/
│   ├── orders/
│   │   └── page.tsx
│   └── active-orders/
│       └── page.tsx
```

---

## 👨‍💼 SPRINT 2: ADMIN & KDS (Commits 18-27)

### ═══════════════════════════════════════════════════════
### COMMIT 18: Admin login page
**Author:** Dev C  
**Message:** `feat(frontend): Add admin login page`  
**Date:** 10/01/2026

```
📁 Files to add:
├── frontend/app/admin/
│   └── login/
│       └── page.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 19: Admin layout with sidebar
**Author:** Dev C  
**Message:** `feat(frontend): Add admin dashboard layout`  
**Date:** 10/01/2026

```
📁 Files to add:
├── frontend/components/admin/
│   └── admin-layout.tsx
├── frontend/components/ui/
│   └── sidebar.tsx               (nếu chưa có)
├── frontend/components/
│   └── theme-provider.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 20: Admin dashboard
**Author:** Dev C  
**Message:** `feat(frontend): Add admin dashboard with stats`  
**Date:** 11/01/2026

```
📁 Files to add:
├── frontend/app/admin/
│   └── dashboard/
│       └── page.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 21: Admin menu management
**Author:** Dev C  
**Message:** `feat(frontend): Add menu management CRUD`  
**Date:** 11/01/2026

```
📁 Files to add:
├── frontend/app/admin/
│   └── menu/
│       └── (all files in folder)
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 22: Table & QR API
**Author:** Dev B  
**Message:** `feat(backend): Add table management and QR generation API`  
**Date:** 12/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   ├── tables.js
│   └── qr.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 23: Admin table management
**Author:** Dev C  
**Message:** `feat(frontend): Add table management with QR codes`  
**Date:** 12/01/2026

```
📁 Files to add:
├── frontend/app/admin/
│   └── tables/
│       └── page.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 24: Kitchen & Waiter API
**Author:** Dev B  
**Message:** `feat(backend): Add kitchen and waiter API`  
**Date:** 13/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   ├── kitchen.js
│   └── waiter.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 25: Kitchen Display System
**Author:** Dev C  
**Message:** `feat(frontend): Add Kitchen Display System with real-time`  
**Date:** 13/01/2026

```
📁 Files to add:
├── frontend/app/kitchen/
│   ├── page.tsx
│   └── login/
│       └── page.tsx
├── frontend/app/admin/
│   └── kds/
│       └── page.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 26: Waiter management
**Author:** Dev C  
**Message:** `feat(frontend): Add waiter order management`  
**Date:** 14/01/2026

```
📁 Files to add:
├── frontend/app/waiter/
│   ├── login/
│   │   └── page.tsx
│   └── orders/
│       └── page.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 27: Guest authentication pages
**Author:** Dev C  
**Message:** `feat(frontend): Add guest login and registration`  
**Date:** 14/01/2026

```
📁 Files to add:
├── frontend/app/guest/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── verify-email/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── reset-password/
│       └── page.tsx
```

---

## 💳 SPRINT 3: PAYMENT & REPORTS (Commits 28-35)

### ═══════════════════════════════════════════════════════
### COMMIT 28: Payment API
**Author:** Dev B  
**Message:** `feat(backend): Add payment and billing API`  
**Date:** 15/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   └── payment.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 29: Guest payment pages
**Author:** Dev A  
**Message:** `feat(frontend): Add payment page with Stripe integration`  
**Date:** 15/01/2026

```
📁 Files to add:
├── frontend/app/guest/
│   ├── payment/
│   │   └── [orderId]/
│   │       └── page.tsx
│   └── pending-payment/
│       └── page.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 30: Reports API
**Author:** Dev B  
**Message:** `feat(backend): Add revenue and analytics API`  
**Date:** 16/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   └── reports.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 31: Reports dashboard
**Author:** Dev C  
**Message:** `feat(frontend): Add reports dashboard with charts`  
**Date:** 16/01/2026

```
📁 Files to add:
├── frontend/app/admin/
│   └── reports/
│       └── page.tsx
├── frontend/components/ui/
│   └── chart.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 32: Reviews API
**Author:** Dev B  
**Message:** `feat(backend): Add menu item reviews API`  
**Date:** 17/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   └── reviews.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 33: Guest review page
**Author:** Dev A  
**Message:** `feat(frontend): Add review page`  
**Date:** 17/01/2026

```
📁 Files to add:
├── frontend/app/guest/
│   └── review/
│       └── page.tsx
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 34: Customer & Profile API
**Author:** Dev B  
**Message:** `feat(backend): Add customer profile API`  
**Date:** 17/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   └── customer.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 35: Guest profile pages
**Author:** Dev A  
**Message:** `feat(frontend): Add guest profile and history`  
**Date:** 18/01/2026

```
📁 Files to add:
├── frontend/app/guest/
│   ├── profile/
│   │   └── page.tsx
│   ├── history/
│   │   └── page.tsx
│   └── change-password/
│       └── page.tsx
```

---

## 🔧 SPRINT 4: POLISH (Commits 36-40)

### ═══════════════════════════════════════════════════════
### COMMIT 36: User management API
**Author:** Dev B  
**Message:** `feat(backend): Add staff user management`  
**Date:** 18/01/2026

```
📁 Files to add:
├── backend/src/routes/
│   ├── users.js
│   └── superadmin.js
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 37: Password reset pages
**Author:** Dev C  
**Message:** `feat(frontend): Add password management pages`  
**Date:** 19/01/2026

```
📁 Files to add:
├── frontend/app/admin/
│   ├── change-password/
│   ├── forgot-password/
│   └── reset-password/
├── frontend/app/waiter/
│   ├── change-password/
│   ├── forgot-password/
│   └── reset-password/
├── frontend/app/kitchen/
│   ├── change-password/
│   ├── forgot-password/
│   └── reset-password/
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 38: Bug fixes
**Author:** Dev A  
**Message:** `fix(frontend): Fix cart and checkout bugs`  
**Date:** 19/01/2026

```
📁 Files to update:
(various bug fixes - list specific files fixed)
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 39: Mobile responsive
**Author:** Dev C  
**Message:** `style(frontend): Improve mobile responsiveness`  
**Date:** 19/01/2026

```
📁 Files to update:
├── frontend/app/globals.css
└── (other style updates)
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 40: Execution docs
**Author:** Dev A  
**Message:** `docs: Add sprint execution documentation`  
**Date:** 20/01/2026

```
📁 Files to add:
├── docs/03-execution/
│   ├── DAILY_STANDUP_LOG.md
│   ├── SPRINT_BACKLOG.md
│   ├── TECHNICAL_DECISIONS.md
│   └── CODE_REVIEW_CHECKLIST.md
```

---

## 🚀 SPRINT 5: DEPLOY (Commits 41-45)

### ═══════════════════════════════════════════════════════
### COMMIT 41: Monitoring docs
**Author:** Dev A  
**Message:** `docs: Add monitoring and tracking documentation`  
**Date:** 20/01/2026

```
📁 Files to add:
├── docs/04-monitoring/
│   ├── BURNDOWN_CHART.md
│   ├── ISSUE_TRACKER.md
│   ├── SPRINT_RETROSPECTIVE.md
│   └── GIT_STATISTICS.md
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 42: Closure docs
**Author:** Dev A  
**Message:** `docs: Add deployment and demo documentation`  
**Date:** 21/01/2026

```
📁 Files to add:
├── docs/05-closure/
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── DEMO_SCRIPT.md
│   └── LESSONS_LEARNED.md
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 43: API documentation
**Author:** Dev B  
**Message:** `docs: Add complete API documentation`  
**Date:** 21/01/2026

```
📁 Files to add:
├── docs/
│   └── API_DOCUMENTATION.md
├── backend/
│   └── README.md
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 44: Final guides
**Author:** Dev A  
**Message:** `docs: Add usage guides`  
**Date:** 22/01/2026

```
📁 Files to add:
├── docs/
│   ├── GIT_RESTRUCTURE_GUIDE.md
│   └── DOCUMENTATION_USAGE_GUIDE.md
```

---

### ═══════════════════════════════════════════════════════
### COMMIT 45: Final README
**Author:** Dev A  
**Message:** `docs: Update README with complete project overview`  
**Date:** 22/01/2026

```
📁 Files to update:
├── README.md                     (full version)
├── SETUP_GUIDE.md
└── HUONG_DAN_CHAY_DEMO.md
```

---

## 📊 THỐNG KÊ COMMITS

| Sprint | Commits | Dev A | Dev B | Dev C |
|--------|---------|-------|-------|-------|
| 0 | 5 | 1 | 3 | 1 |
| 1 | 12 | 6 | 5 | 1 |
| 2 | 10 | 0 | 3 | 7 |
| 3 | 8 | 3 | 4 | 1 |
| 4 | 5 | 1 | 1 | 3 |
| 5 | 5 | 4 | 1 | 0 |
| **Total** | **45** | **15** | **17** | **13** |

**Percentage:** Dev A (33%), Dev B (38%), Dev C (29%)

---

## ⚡ QUICK START SCRIPT

```powershell
# 1. Tạo folder mới
cd F:\Web
mkdir smart-restaurant-new
cd smart-restaurant-new
git init

# 2. Set author cho Dev B (commit 1-4)
git config user.name "DevB Name"
git config user.email "devb@example.com"

# 3. Set date cho commit 1
$env:GIT_AUTHOR_DATE = "2026-01-03T09:00:00"
$env:GIT_COMMITTER_DATE = "2026-01-03T09:00:00"

# 4. Copy files và commit
# ... copy files ...
git add .
git commit -m "chore: Initialize project structure"

# 5. Tiếp tục với các commits khác...
```
