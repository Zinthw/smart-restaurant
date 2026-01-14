# 📋 Hướng Dẫn Setup Jira Cho Smart Restaurant

## Mục Tiêu
Tổ chức project trên Jira theo chuẩn Agile/Scrum cho team 3 người.

---

## 🚀 Bước 1: Tạo Project Mới

### 1.1 Đăng ký Jira
1. Vào [jira.atlassian.com](https://www.atlassian.com/software/jira/free)
2. Đăng ký tài khoản Free (10 users miễn phí)
3. Tạo workspace mới

### 1.2 Tạo Project
1. Click **"Create project"**
2. Chọn template: **"Scrum"**
3. Tên project: `Smart Restaurant` hoặc `SR`
4. Key: `SR` (prefix cho issues: SR-1, SR-2, ...)

---

## 👥 Bước 2: Thêm Team Members

### 2.1 Invite Members
1. Project Settings → People
2. Add people với email

### 2.2 Assign Roles
| Member | Jira Role | Project Role |
|--------|-----------|--------------|
| Dev A | Admin | Team Lead / FE Customer |
| Dev B | Member | Backend / Infra |
| Dev C | Member | FE Admin / QA |

---

## 🏷️ Bước 3: Cấu Hình Issue Types

### 3.1 Issue Types cần có
| Type | Mục đích | Ví dụ |
|------|----------|-------|
| **Epic** | Feature lớn | Guest Ordering, Admin Panel |
| **Story** | User story | "As a guest, I can add items to cart" |
| **Task** | Technical task | "Setup Socket.IO" |
| **Bug** | Lỗi cần fix | "Cart không clear sau checkout" |
| **Sub-task** | Task con | "Create CartContext" |

### 3.2 Tạo Custom Fields (Optional)
- **Story Points**: 1, 2, 3, 5, 8, 13
- **Sprint**: Sprint 0, 1, 2, 3, 4, 5
- **Module**: Frontend, Backend, Database, Docs

---

## 📌 Bước 4: Tạo Epics

Tạo 6 Epics theo modules:

| Epic | Key | Description |
|------|-----|-------------|
| Guest Ordering | SR-1 | QR scan, menu, cart, order, payment |
| Admin Panel | SR-2 | Dashboard, menu management, tables |
| Staff Operations | SR-3 | Waiter, KDS |
| Infrastructure | SR-4 | Auth, Socket.IO, Database |
| Documentation | SR-5 | Docs, demo, self-assessment |
| Testing & Deploy | SR-6 | QA, bug fix, deploy |

---

## 📝 Bước 5: Tạo User Stories

### Epic: Guest Ordering (SR-1)

| Story | Summary | Story Points | Assignee |
|-------|---------|--------------|----------|
| SR-7 | As a guest, I can view menu by scanning QR | 5 | Dev A |
| SR-8 | As a guest, I can filter menu by category | 3 | Dev A |
| SR-9 | As a guest, I can search menu items | 3 | Dev A |
| SR-10 | As a guest, I can view item details with modifiers | 3 | Dev A |
| SR-11 | As a guest, I can add items to cart | 5 | Dev A |
| SR-12 | As a guest, I can edit/remove cart items | 3 | Dev A |
| SR-13 | As a guest, I can submit my order | 5 | Dev A |
| SR-14 | As a guest, I can track order status real-time | 5 | Dev A |
| SR-15 | As a guest, I can view and pay my bill | 5 | Dev A |

### Epic: Admin Panel (SR-2)

| Story | Summary | Story Points | Assignee |
|-------|---------|--------------|----------|
| SR-16 | As admin, I can login to dashboard | 3 | Dev C |
| SR-17 | As admin, I can view dashboard stats | 5 | Dev C |
| SR-18 | As admin, I can manage menu categories | 5 | Dev C |
| SR-19 | As admin, I can manage menu items | 5 | Dev C |
| SR-20 | As admin, I can manage tables | 3 | Dev C |
| SR-21 | As admin, I can generate QR codes | 3 | Dev B |
| SR-22 | As admin, I can view reports | 5 | Dev C |

### Epic: Staff Operations (SR-3)

| Story | Summary | Story Points | Assignee |
|-------|---------|--------------|----------|
| SR-23 | As waiter, I can view pending orders | 3 | Dev C |
| SR-24 | As waiter, I can accept/reject orders | 3 | Dev C |
| SR-25 | As waiter, I can mark orders served | 2 | Dev C |
| SR-26 | As kitchen, I can view orders on KDS | 5 | Dev C |
| SR-27 | As kitchen, I can update order status | 3 | Dev C |
| SR-28 | As kitchen, I see real-time new orders | 5 | Dev B |

### Epic: Infrastructure (SR-4)

| Story | Summary | Story Points | Assignee |
|-------|---------|--------------|----------|
| SR-29 | Setup database schema | 5 | Dev B |
| SR-30 | Implement JWT authentication | 5 | Dev B |
| SR-31 | Create Menu API | 5 | Dev B |
| SR-32 | Create Orders API | 5 | Dev B |
| SR-33 | Setup Socket.IO real-time | 5 | Dev B |
| SR-34 | Create Payment API | 5 | Dev B |
| SR-35 | Create Reports API | 3 | Dev B |

---

## 📅 Bước 6: Tạo Sprints

### Tạo 6 Sprints
1. Vào Backlog
2. Click "Create Sprint"
3. Đặt tên và dates:

| Sprint | Name | Dates | Goal |
|--------|------|-------|------|
| Sprint 0 | Setup & Foundation | 03-04/01 | Project skeleton |
| Sprint 1 | Guest Ordering | 05-09/01 | Cart & Order MVP |
| Sprint 2 | Admin & KDS | 10-14/01 | Admin panel + KDS |
| Sprint 3 | Payment & Reports | 15-18/01 | Payment flow |
| Sprint 4 | Testing | 19-20/01 | Bug fixes |
| Sprint 5 | Deploy | 21-22/01 | Go live |

### Assign Stories to Sprints
Drag stories from Backlog vào từng Sprint:

**Sprint 0:** SR-29, SR-30 (Database, Auth skeleton)
**Sprint 1:** SR-7 → SR-14, SR-31, SR-32, SR-33
**Sprint 2:** SR-16 → SR-28
**Sprint 3:** SR-15, SR-22, SR-34, SR-35
**Sprint 4:** Bug fix issues
**Sprint 5:** Deploy tasks

---

## 🎯 Bước 7: Cấu Hình Board

### 7.1 Columns
| Column | Status |
|--------|--------|
| To Do | Chưa bắt đầu |
| In Progress | Đang làm |
| Code Review | Chờ review |
| Done | Hoàn thành |

### 7.2 Swimlanes
Group by: **Assignee** (để thấy ai đang làm gì)

### 7.3 Quick Filters
- My Issues Only
- Current Sprint
- Bugs Only

---

## 📊 Bước 8: Dashboard Setup

### Tạo Dashboard với Gadgets:

| Gadget | Mục đích |
|--------|----------|
| **Sprint Burndown Chart** | Track progress |
| **Pie Chart: By Assignee** | Workload distribution |
| **Created vs Resolved** | Bug trend |
| **Filter Results** | Current sprint issues |
| **Activity Stream** | Recent activities |

---

## 🔄 Bước 9: Workflow Hàng Ngày

### Daily Standup (9:00 AM)
1. Mở Jira Active Sprint board
2. Mỗi người update status của issues
3. Move cards giữa columns
4. Log work nếu cần

### Khi Bắt Đầu Task
1. Assign issue cho mình
2. Move to **"In Progress"**
3. Create branch: `feature/SR-XX-description`

### Khi Hoàn Thành
1. Create PR với reference `SR-XX`
2. Move to **"Code Review"**
3. Sau khi merge → Move to **"Done"**

### Khi Tìm Thấy Bug
1. Create Bug issue
2. Set Priority: Critical/High/Medium/Low
3. Link to related Story

---

## 🔗 Bước 10: Tích Hợp GitHub

### Connect GitHub to Jira
1. Apps → Find "GitHub for Jira"
2. Install và authorize
3. Connect repository

### Smart Commits
Dùng issue key trong commit message:
```
SR-11 feat: Add cart functionality
SR-11 #comment Added CartContext
SR-15 #done Completed payment flow
```

### Benefits
- Commits appear trong Jira issue
- PR links tự động
- Transition issues từ commit

---

## 📈 Metrics Theo Dõi

### Sprint Metrics
| Metric | Cách xem |
|--------|----------|
| Velocity | Sprint Report |
| Burndown | Burndown Chart |
| Cycle Time | Control Chart |

### Team Metrics
| Metric | Gadget |
|--------|--------|
| Stories by Assignee | Pie Chart |
| Bugs Created/Resolved | Created vs Resolved |

---

## ✅ Checklist Setup

- [ ] Tạo Jira project với Scrum template
- [ ] Invite 3 team members
- [ ] Tạo 6 Epics
- [ ] Tạo ~35 User Stories
- [ ] Tạo 6 Sprints với dates
- [ ] Assign stories to sprints
- [ ] Configure board columns
- [ ] Setup Dashboard
- [ ] Connect GitHub
- [ ] Test workflow: create → progress → done

---

## 📱 Jira Mobile App

Download **Jira Cloud** app cho:
- iOS: App Store
- Android: Google Play

Tiện cho daily updates khi không có laptop.

---

## 🎁 Tips

1. **Dùng Labels** để categorize: `frontend`, `backend`, `urgent`
2. **Link Issues** để track dependencies
3. **Use Components** cho modules: Guest, Admin, Waiter, Kitchen
4. **Set Story Points** trong Sprint Planning
5. **Update Status** realtime để Board accurate

---

## 📋 Mapping Docs → Jira

| Docs File | Jira Equivalent |
|-----------|-----------------|
| SPRINT_PLANNING.md | Sprint Backlog |
| SPRINT_BACKLOG.md | Active Sprint Board |
| ISSUE_TRACKER.md | Bug Issues |
| BURNDOWN_CHART.md | Sprint Report |
| DAILY_STANDUP_LOG.md | Updates in issues + Activity Stream |

---

*Jira sẽ thay thế nhiều docs thủ công, nhưng vẫn nên giữ PROJECT_CHARTER, TEAM_ORGANIZATION, và DEMO_SCRIPT.*
