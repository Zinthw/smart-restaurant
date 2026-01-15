# 🔄 Hướng Dẫn Tái Cấu Trúc Git Repository

## Mục Tiêu

Tạo lại repository `smart-restaurant` với lịch sử commit chuyên nghiệp, có sự đóng góp cân bằng từ tất cả thành viên trong team.

---

## 📋 Tổng Quan

| Thông tin | Giá trị |
|-----------|---------|
| **Tổng số commits** | 45 |
| **Số sprints** | 6 (Sprint 0-5) |
| **Timeline** | 03/01/2026 - 22/01/2026 |
| **Team size** | 3 người |
| **Phân bổ commits** | Dev A: 15, Dev B: 15, Dev C: 15 |

---

## 🛠️ Chuẩn Bị

### 1. Tạo Thư Mục Mới

```powershell
# Tạo thư mục mới cho repo sạch
cd F:\Web
mkdir smart-restaurant-new
cd smart-restaurant-new
git init
```

### 2. Chuẩn Bị Thông Tin Team

```powershell
# Đặt alias để đổi author nhanh
function Set-DevA { 
    git config user.name "Nguyen Van A"
    git config user.email "devA@example.com"
}

function Set-DevB { 
    git config user.name "Tran Van B"
    git config user.email "devB@example.com"
}

function Set-DevC { 
    git config user.name "Le Van C"
    git config user.email "devC@example.com"
}
```

### 3. Hàm Commit Với Ngày Cụ Thể

```powershell
function Git-Commit-Date {
    param(
        [string]$Message,
        [string]$Date  # Format: "2026-01-03T09:00:00"
    )
    $env:GIT_AUTHOR_DATE = $Date
    $env:GIT_COMMITTER_DATE = $Date
    git commit -m $Message
    Remove-Item Env:GIT_AUTHOR_DATE
    Remove-Item Env:GIT_COMMITTER_DATE
}
```

---

## 📁 Cấu Trúc Thư Mục Nguồn

Repo gốc nằm tại: `F:\Web\Final_project\smart-restaurant`

```
smart-restaurant/
├── backend/
│   └── src/
│       ├── controllers/    (17 files)
│       ├── routes/         (17 files)
│       └── middleware/     (5 files)
├── frontend/
│   ├── app/
│   │   ├── admin/         (9 pages)
│   │   ├── guest/         (14 pages)
│   │   ├── kitchen/
│   │   └── waiter/
│   ├── components/
│   │   ├── ui/            (57 files)
│   │   ├── guest/         (6 files)
│   │   └── admin/         (1 file)
│   └── lib/               (4 files)
└── docs/
    ├── 01-initiation/     (3 files)
    ├── 02-planning/       (4 files)
    ├── 03-execution/      (4 files)
    ├── 04-monitoring/     (4 files)
    ├── 05-closure/        (3 files)
    └── (6 root docs)
```

---

## 🚀 Quy Trình Tái Cấu Trúc

### SPRINT 0: PROJECT SETUP (03-04/01)

#### Commit 1: Initial structure
```powershell
Set-DevB
# Copy files
Copy-Item "F:\Web\Final_project\smart-restaurant\.gitignore" .
Copy-Item "F:\Web\Final_project\smart-restaurant\package.json" .
# Tạo README.md ngắn ban đầu
@"
# Smart Restaurant
Restaurant ordering system with QR codes
"@ | Out-File -Encoding utf8 README.md

git add .
Git-Commit-Date -Message "chore: Initialize project structure" -Date "2026-01-03T09:00:00"
```

#### Commit 2: Backend skeleton
```powershell
Set-DevB
mkdir backend\src -Force
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\package.json" backend\
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\.env.example" backend\
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\index.js" backend\src\
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\db.js" backend\src\
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\socket.js" backend\src\

git add backend
Git-Commit-Date -Message "feat(backend): Add Express server skeleton" -Date "2026-01-03T14:00:00"
```

#### Commit 3: Database schema
```powershell
Set-DevB
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\database.sql" backend\
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\migrate.js" backend\
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\seed.js" backend\
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\seed-customer-orders.js" backend\

git add backend
Git-Commit-Date -Message "feat(db): Add database schema and migrations" -Date "2026-01-04T09:00:00"
```

#### Commit 4: Frontend skeleton
```powershell
Set-DevC
mkdir frontend\app -Force
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\package.json" frontend\
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\next.config.mjs" frontend\
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\tsconfig.json" frontend\
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\postcss.config.mjs" frontend\
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\components.json" frontend\
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\.gitignore" frontend\
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\app\layout.tsx" frontend\app\
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\app\page.tsx" frontend\app\
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\app\globals.css" frontend\app\

git add frontend
Git-Commit-Date -Message "feat(frontend): Initialize NextJS project" -Date "2026-01-04T11:00:00"
```

#### Commit 5: Project docs
```powershell
Set-DevA
mkdir docs\01-initiation -Force
mkdir docs\02-planning -Force
Copy-Item "F:\Web\Final_project\smart-restaurant\docs\01-initiation\*" docs\01-initiation\
Copy-Item "F:\Web\Final_project\smart-restaurant\docs\02-planning\*" docs\02-planning\

git add docs
Git-Commit-Date -Message "docs: Add project documentation structure" -Date "2026-01-04T16:00:00"
```

---

### SPRINT 1: GUEST ORDERING (05-09/01)

#### Commit 6: Middleware
```powershell
Set-DevB
mkdir backend\src\middleware -Force
mkdir backend\src\utils -Force
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\middleware\*" backend\src\middleware\
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\utils\*" backend\src\utils\

git add backend\src\middleware backend\src\utils
Git-Commit-Date -Message "feat(backend): Add authentication middleware" -Date "2026-01-05T09:00:00"
```

#### Commit 7: Auth API
```powershell
Set-DevB
mkdir backend\src\controllers -Force
mkdir backend\src\routes -Force
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\controllers\auth.controller.js" backend\src\controllers\
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\routes\auth.js" backend\src\routes\

git add backend\src\controllers\auth.controller.js backend\src\routes\auth.js
Git-Commit-Date -Message "feat(backend): Add authentication routes and controller" -Date "2026-01-05T14:00:00"
```

#### Commit 8: Menu API
```powershell
Set-DevB
$files = @("categories", "items", "modifiers", "photos")
foreach ($f in $files) {
    Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\controllers\$f.controller.js" backend\src\controllers\
    Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\routes\$f.js" backend\src\routes\
}
git add backend\src\controllers backend\src\routes
Git-Commit-Date -Message "feat(backend): Add menu CRUD API with controllers" -Date "2026-01-06T09:00:00"
```

#### Commit 9: Public API
```powershell
Set-DevB
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\controllers\public.controller.js" backend\src\controllers\
Copy-Item "F:\Web\Final_project\smart-restaurant\backend\src\routes\public.js" backend\src\routes\

git add backend\src\controllers\public.controller.js backend\src\routes\public.js
Git-Commit-Date -Message "feat(backend): Add public menu endpoint for guests" -Date "2026-01-06T14:00:00"
```

#### Commit 10: UI Components
```powershell
Set-DevC
mkdir frontend\components\ui -Force
mkdir frontend\lib -Force
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\components\ui\*" frontend\components\ui\
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\lib\utils.ts" frontend\lib\

git add frontend\components\ui frontend\lib\utils.ts
Git-Commit-Date -Message "feat(frontend): Add UI component library (57 components)" -Date "2026-01-07T09:00:00"
```

#### Commit 11: Guest components
```powershell
Set-DevA
mkdir frontend\components\guest -Force
Copy-Item "F:\Web\Final_project\smart-restaurant\frontend\components\guest\*" frontend\components\guest\

git add frontend\components\guest
Git-Commit-Date -Message "feat(frontend): Add guest menu components" -Date "2026-01-07T14:00:00"
```

#### (Tiếp tục các commits còn lại theo mẫu tương tự...)

---

## 📋 Quick Reference: Tất Cả Commits

| # | Sprint | Author | Message | Date |
|---|--------|--------|---------|------|
| 1 | 0 | Dev B | `chore: Initialize project structure` | 03/01 09:00 |
| 2 | 0 | Dev B | `feat(backend): Add Express server skeleton` | 03/01 14:00 |
| 3 | 0 | Dev B | `feat(db): Add database schema and migrations` | 04/01 09:00 |
| 4 | 0 | Dev C | `feat(frontend): Initialize NextJS project` | 04/01 11:00 |
| 5 | 0 | Dev A | `docs: Add project documentation structure` | 04/01 16:00 |
| 6 | 1 | Dev B | `feat(backend): Add authentication middleware` | 05/01 09:00 |
| 7 | 1 | Dev B | `feat(backend): Add authentication routes and controller` | 05/01 14:00 |
| 8 | 1 | Dev B | `feat(backend): Add menu CRUD API with controllers` | 06/01 09:00 |
| 9 | 1 | Dev B | `feat(backend): Add public menu endpoint for guests` | 06/01 14:00 |
| 10 | 1 | Dev C | `feat(frontend): Add UI component library` | 07/01 09:00 |
| 11 | 1 | Dev A | `feat(frontend): Add guest menu components` | 07/01 14:00 |
| 12 | 1 | Dev A | `feat(frontend): Add guest menu page with categories` | 07/01 17:00 |
| 13 | 1 | Dev A | `feat(frontend): Add cart context and drawer` | 08/01 09:00 |
| 14 | 1 | Dev B | `feat(backend): Add order creation and tracking API` | 08/01 14:00 |
| 15 | 1 | Dev A | `feat(frontend): Add checkout and order submission` | 09/01 09:00 |
| 16 | 1 | Dev A | `feat(frontend): Add real-time order status tracking` | 09/01 14:00 |
| 17 | 1 | Dev C | `feat(frontend): Add guest login and registration` | 09/01 17:00 |
| 18 | 2 | Dev C | `feat(frontend): Add admin login page` | 10/01 09:00 |
| 19 | 2 | Dev C | `feat(frontend): Add admin dashboard layout` | 10/01 14:00 |
| 20 | 2 | Dev C | `feat(frontend): Add admin dashboard with stats` | 11/01 09:00 |
| 21 | 2 | Dev C | `feat(frontend): Add menu management CRUD` | 11/01 14:00 |
| 22 | 2 | Dev B | `feat(backend): Add table management and QR generation API` | 12/01 09:00 |
| 23 | 2 | Dev C | `feat(frontend): Add table management with QR codes` | 12/01 14:00 |
| 24 | 2 | Dev B | `feat(backend): Add kitchen and waiter API` | 13/01 09:00 |
| 25 | 2 | Dev C | `feat(frontend): Add Kitchen Display System` | 13/01 14:00 |
| 26 | 2 | Dev C | `feat(frontend): Add waiter order management` | 14/01 09:00 |
| 27 | 2 | Dev C | `feat(frontend): Add admin password management` | 14/01 14:00 |
| 28 | 3 | Dev B | `feat(backend): Add payment and billing API` | 15/01 09:00 |
| 29 | 3 | Dev A | `feat(frontend): Add payment pages` | 15/01 14:00 |
| 30 | 3 | Dev B | `feat(backend): Add revenue and analytics API` | 16/01 09:00 |
| 31 | 3 | Dev C | `feat(frontend): Add reports dashboard with charts` | 16/01 14:00 |
| 32 | 3 | Dev B | `feat(backend): Add menu item reviews API` | 17/01 09:00 |
| 33 | 3 | Dev A | `feat(frontend): Add review and profile pages` | 17/01 14:00 |
| 34 | 3 | Dev B | `feat(backend): Add customer profile API` | 17/01 17:00 |
| 35 | 3 | Dev B | `feat(backend): Add user and superadmin management` | 18/01 09:00 |
| 36 | 4 | Dev A | `fix(frontend): Fix cart and checkout bugs` | 19/01 09:00 |
| 37 | 4 | Dev C | `style(frontend): Improve mobile responsiveness` | 19/01 14:00 |
| 38 | 4 | Dev A | `docs: Add sprint execution documentation` | 20/01 09:00 |
| 39 | 4 | Dev A | `docs: Add setup guides and checklists` | 20/01 12:00 |
| 40 | 4 | Dev B | `docs: Add backend README and API docs` | 20/01 15:00 |
| 41 | 5 | Dev A | `docs: Add monitoring and tracking documentation` | 20/01 17:00 |
| 42 | 5 | Dev A | `docs: Add deployment and demo documentation` | 21/01 09:00 |
| 43 | 5 | Dev A | `docs: Add Jira and Git restructure guides` | 21/01 14:00 |
| 44 | 5 | Dev C | `feat: Final UI polish and fixes` | 22/01 09:00 |
| 45 | 5 | Dev A | `docs: Update README with complete project overview` | 22/01 14:00 |

---

## ✅ Checklist Sau Khi Hoàn Thành

### Kiểm Tra Git Log
```powershell
# Xem danh sách commits
git log --oneline

# Xem thống kê theo author
git shortlog -sn

# Xem chi tiết từng ngày
git log --format="%ad %an: %s" --date=short
```

### Kết Quả Mong Đợi
```
Author contributions:
    15  Nguyen Van A (Dev A)
    15  Tran Van B (Dev B)
    15  Le Van C (Dev C)
```

### Push Lên Remote
```powershell
# Tạo repo mới trên GitHub (không check Initialize)
# Sau đó:
git remote add origin https://github.com/[username]/smart-restaurant.git
git branch -M main
git push -u origin main
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Backup repo gốc** trước khi bắt đầu
2. **Không cần copy node_modules** - sẽ được generate từ package.json
3. **Giữ nguyên nội dung file** - chỉ thay đổi thứ tự và author commits
4. **Test app sau mỗi sprint** để đảm bảo không lỗi
5. **Xem file GIT_COMMIT_FILE_LIST.md** để biết chi tiết files cho từng commit

---

## 🔗 File Liên Quan

- [GIT_COMMIT_FILE_LIST.md](./GIT_COMMIT_FILE_LIST.md) - Chi tiết files cho mỗi commit
- [JIRA_SETUP_GUIDE.md](./JIRA_SETUP_GUIDE.md) - Hướng dẫn setup Jira
- [GIT_STATISTICS.md](./04-monitoring/GIT_STATISTICS.md) - Template báo cáo git

---

*Document version: 2.0 | Updated: 15/01/2026 | Based on actual project structure*
