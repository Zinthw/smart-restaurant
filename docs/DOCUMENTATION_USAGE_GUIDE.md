# 📚 Hướng Dẫn Sử Dụng Bộ Tài Liệu Project Management

## Tổng Quan Bộ Docs

Bộ tài liệu này được thiết kế theo **PMBOK + Agile/Scrum** cho team 3 người. Mỗi file có mục đích riêng và cần được update theo đúng timeline.

---

## 📅 Khi Nào Dùng File Nào?

### PHASE 0: KHỞI ĐỘNG (Ngày 1-2)

| Khi nào | Làm gì | File |
|---------|--------|------|
| Ngày 1 sáng | Điền thông tin team, Student IDs | `01-initiation/PROJECT_CHARTER.md` |
| Ngày 1 sáng | Điền tên thật, email, Git username | `01-initiation/TEAM_ORGANIZATION.md` |
| Ngày 1 sáng | Xác nhận meetings time | `01-initiation/COMMUNICATION_PLAN.md` |
| Ngày 1 chiều | Review WBS, xác nhận story points | `02-planning/WORK_BREAKDOWN_STRUCTURE.md` |
| Ngày 1 chiều | Custom sprint tasks theo resources | `02-planning/SPRINT_PLANNING.md` |

---

### HÀNG NGÀY (Ngày 3-20)

| Khi nào | Làm gì | File |
|---------|--------|------|
| **9:00 AM** | Ghi standup notes | `03-execution/DAILY_STANDUP_LOG.md` |
| Sau standup | Update task status | `03-execution/SPRINT_BACKLOG.md` |
| Khi có bug | Log issue | `04-monitoring/ISSUE_TRACKER.md` |
| Cuối ngày | Update burndown | `04-monitoring/BURNDOWN_CHART.md` |

---

### CUỐI MỖI SPRINT

| Sprint | Ngày | Việc cần làm | File |
|--------|------|--------------|------|
| Sprint 0 | Ngày 2 | Viết retro | `04-monitoring/SPRINT_RETROSPECTIVE.md` |
| Sprint 1 | Ngày 7 | Viết retro | `04-monitoring/SPRINT_RETROSPECTIVE.md` |
| Sprint 2 | Ngày 12 | Viết retro | `04-monitoring/SPRINT_RETROSPECTIVE.md` |
| Sprint 3 | Ngày 16 | Viết retro | `04-monitoring/SPRINT_RETROSPECTIVE.md` |
| Sprint 4 | Ngày 18 | Viết retro | `04-monitoring/SPRINT_RETROSPECTIVE.md` |

---

### PHASE CUỐI: ĐÓNG PROJECT (Ngày 19-22)

| Khi nào | Làm gì | File |
|---------|--------|------|
| Ngày 19 | Chạy git stats commands | `04-monitoring/GIT_STATISTICS.md` |
| Ngày 19 | Review deployment checklist | `05-closure/DEPLOYMENT_CHECKLIST.md` |
| Ngày 19-20 | Luyện demo theo script | `05-closure/DEMO_SCRIPT.md` |
| Ngày 21 | Viết lessons learned | `05-closure/LESSONS_LEARNED.md` |
| Ngày 22 | Copy data vào Self Assessment | `SELF_ASSESSMENT_REPORT.md` |

---

## ✍️ Files Cần Update Thường Xuyên

### 1. DAILY_STANDUP_LOG.md - Mỗi ngày
```markdown
## Day X - DD/MM/YYYY

### Dev A
- **Yesterday:** Completed CartContext, CartDrawer
- **Today:** Working on Add to Cart
- **Blockers:** None

### Dev B
...
```

### 2. SPRINT_BACKLOG.md - Khi hoàn thành task
```markdown
| S1-1 | Cart functionality | 5 | Dev A | [x] Done |  ← Đổi từ [ ] sang [x]
```

### 3. BURNDOWN_CHART.md - Cuối ngày
```markdown
| 3 | 05/01 | 40 | 8 | 32 |  ← Update actual completed SP
```

### 4. ISSUE_TRACKER.md - Khi có bug
```markdown
| #007 | Cart không clear | 🟠 High | Dev A | 10/01 | - | 🔴 Open |
```

---

## 🔄 Workflow Chuẩn Hàng Ngày

```
9:00 AM   → Daily Standup (15 min)
          → Cập nhật DAILY_STANDUP_LOG.md

9:15 AM   → Coding Session 1

12:00 PM  → Lunch

1:00 PM   → Coding Session 2
          → PR reviews

5:00 PM   → Update SPRINT_BACKLOG.md
          → Update BURNDOWN_CHART.md
          → Log any issues to ISSUE_TRACKER.md

6:00 PM   → End of day
```

---

## 📊 Trước Khi Nộp Bài

### Checklist để lấy dữ liệu cho SELF_ASSESSMENT_REPORT.md:

1. **Git Statistics** - Chạy commands:
```powershell
# Đếm commits mỗi người
git shortlog -sn --all

# Lấy danh sách commits quan trọng
git log --oneline -50
```

2. **Copy vào GIT_STATISTICS.md** - Fill table

3. **Copy vào SELF_ASSESSMENT_REPORT.md** - Section Contributors

---

## 📁 Mapping Docs → Self Assessment

| Self Assessment Section | Lấy từ File |
|------------------------|-------------|
| Team Information | `01-initiation/TEAM_ORGANIZATION.md` |
| Git Contributors | `04-monitoring/GIT_STATISTICS.md` |
| Significant Commits | `04-monitoring/GIT_STATISTICS.md` |
| Project Summary | `01-initiation/PROJECT_CHARTER.md` |

---

## ⚡ Quick Reference

### Commit Message Format
```
type(scope): message

feat(frontend): Add cart functionality
fix(backend): Fix order status not updating
docs: Update API documentation
style: Improve mobile responsiveness
chore: Add deployment configuration
```

### PR Review Checklist
→ Xem `03-execution/CODE_REVIEW_CHECKLIST.md`

### Definition of Done
→ Xem `02-planning/DEFINITION_OF_DONE.md`

---

## ❓ FAQ

**Q: Phải fill tất cả docs mỗi ngày à?**
> A: Không. Chỉ cần: DAILY_STANDUP_LOG (sáng), SPRINT_BACKLOG + BURNDOWN (chiều)

**Q: Có thể bỏ bớt docs không?**
> A: Các docs PHẢI CÓ: PROJECT_CHARTER, TEAM_ORGANIZATION, DAILY_STANDUP_LOG, GIT_STATISTICS, DEMO_SCRIPT

**Q: Làm sao biết đang on track?**
> A: Xem BURNDOWN_CHART.md - nếu actual line dưới ideal line = tốt

**Q: Sprint Retrospective viết gì?**
> A: 3 câu hỏi: What went well? What could improve? Action items?
