# Sprint Retrospective - Smart Restaurant

## Format

Mỗi sprint retrospective theo format:

```
## Sprint X Retrospective - DD/MM/YYYY

### ✅ What Went Well
- [positive feedback]

### ❌ What Could Improve
- [areas for improvement]

### 💡 Action Items
- [ ] [specific action with owner]
```

---

## Sprint 0 Retrospective - 04/01/2026

### ✅ What Went Well
- Team aligned nhanh về scope
- ERD được finalize trong 1 ngày
- Cả BE và FE đều chạy được locally
- Docs structure setup tốt

### ❌ What Could Improve
- Review existing code mất nhiều thời gian hơn dự kiến
- Một số bugs cũ cần fix trước khi làm feature mới

### 💡 Action Items
- [x] Dev C: List tất cả bugs cần fix - Owner: Dev C - Due: Day 3
- [x] Dev B: Finalize Socket.IO approach - Owner: Dev B - Due: Day 3
- [x] All: Setup Slack/Discord cho daily standup - Owner: Dev A - Due: Day 3

---

## Sprint 1 Retrospective - 09/01/2026

### ✅ What Went Well
- Cart feature hoàn thành đúng timeline
- Socket.IO setup thành công
- Guest có thể đặt order và xem status
- Team communication tốt

### ❌ What Could Improve
- Một số edge cases không được handle (empty cart submit)
- Test coverage thấp
- Dev C bị block bởi API chưa sẵn sàng

### 💡 Action Items
- [ ] Dev A: Add validation cho empty cart - Due: Day 8
- [ ] Dev C: Viết test cases trước khi code KDS - Due: Day 8
- [ ] Dev B: Hoàn thành API trước để unblock FE - Due: ongoing

---

## Sprint 2 Retrospective - 14/01/2026

### ✅ What Went Well
- KDS real-time hoạt động ổn định
- Waiter flow complete
- Timer hiển thị đúng
- Bugs từ Sprint 1 được fix

### ❌ What Could Improve
- Mobile responsiveness cần cải thiện
- Sound notification không work trên iOS Safari
- Code review chậm

### 💡 Action Items
- [ ] Dev C: Fix responsive cho mobile - Due: Day 15
- [ ] Dev B: Research iOS audio policy - Due: Day 15
- [ ] All: Review PR trong vòng 2 giờ - Due: ongoing

---

## Sprint 3 Retrospective - 18/01/2026

### ✅ What Went Well
- Payment flow với Stripe hoạt động
- Reports dashboard có charts đẹp
- Đang on track cho deadline

### ❌ What Could Improve
- Payment edge cases (failed payment) chưa handle kỹ
- Reports chậm với data lớn

### 💡 Action Items
- [ ] Dev A: Handle payment failures - Due: Day 17
- [ ] Dev B: Add pagination cho reports - Due: Day 17

---

## Sprint 4 Retrospective - 20/01/2026

### ✅ What Went Well
- Tất cả major bugs fixed
- Demo flow chạy smooth
- Mobile tested OK

### ❌ What Could Improve
- Một số minor UI inconsistencies
- Loading states cần thêm

### 💡 Action Items
- [x] Dev C: Fix UI issues trước deploy
- [x] All: Rehearse demo script

---

## Overall Project Retrospective - 22/01/2026

### Team Performance
| Category | Score (1-5) | Notes |
|----------|-------------|-------|
| Communication | 4/5 | Standups consistent |
| Technical skills | 4/5 | Learned Socket.IO |
| Delivery | 4/5 | On time |
| Code quality | 3/5 | Could improve testing |
| Documentation | 5/5 | Comprehensive |

### What We Learned
1. **Real-time is complex** - Start early, have fallback
2. **Daily standups work** - Quick sync prevents blockers
3. **API-first helps** - FE không bị block khi API ready
4. **Code freeze is important** - No last-minute changes

### What We Would Do Differently
1. Write tests from Sprint 0
2. Setup CI/CD earlier
3. Mobile testing from Sprint 1

---

*Document Version: 1.0 | Last Updated: 22/01/2026*
