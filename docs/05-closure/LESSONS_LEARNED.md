# Lessons Learned - Smart Restaurant

## Project Overview

| Item | Value |
|------|-------|
| **Project** | Smart Restaurant |
| **Duration** | 20 days (03/01 - 22/01/2026) |
| **Team** | 3 developers |
| **Outcome** | ✅ Completed successfully |

---

## What Went Well ✅

### 1. Clear Planning from Day 1
- ERD finalized in Sprint 0
- WBS với story points rõ ràng
- Roles and responsibilities well-defined

**Impact:** Không có confusion về ai làm gì

### 2. Daily Standups
- 15 minutes mỗi sáng
- Quick sync về progress và blockers
- Team aligned consistently

**Impact:** Blockers được resolve nhanh

### 3. API-First Development
- Backend APIs ready trước Frontend
- Mock data cho development
- Swagger documentation có từ sớm

**Impact:** FE team không bị block chờ BE

### 4. Real-time Features Work
- Socket.IO setup thành công
- KDS updates in real-time
- Customer order tracking smooth

**Impact:** Demo ấn tượng với real-time updates

### 5. Comprehensive Documentation
- 17+ documentation files
- Agile artifacts (sprint backlogs, retrospectives)
- Clear deployment runbook

**Impact:** Handover và maintenance dễ dàng

---

## What Could Be Improved ❌

### 1. Testing Coverage
- Unit tests almost none
- E2E tests only manual
- Edge cases discovered late

**Root Cause:** Ưu tiên features over tests do timeline

**Recommendation:** Viết tests cùng với features (TDD approach)

### 2. Mobile Testing Late
- Mobile responsive issues discovered in Sprint 4
- iOS Safari specific bugs
- Touch interactions different from click

**Root Cause:** Focus on desktop development initially

**Recommendation:** Test trên mobile từ Sprint 1

### 3. Code Review Delays
- PR reviews sometimes took >24 hours
- Merging blocked FE work

**Root Cause:** Everyone busy with own tasks

**Recommendation:** Set 4-hour SLA for PR reviews

### 4. Security Review Too Late
- Security review only in Sprint 4
- Some patterns already established

**Root Cause:** Security treated as afterthought

**Recommendation:** Security checklist từ Sprint 0

---

## Key Learnings 📚

### Technical

| Learning | Context |
|----------|---------|
| **Socket.IO complexity** | Cần handle reconnection, rooms, và error cases |
| **JWT refresh** | Access token short, refresh token long, handle expiry |
| **Database indexing** | Report queries slow without proper indexes |
| **CSS on mobile** | Touch states, viewport units, safe areas |

### Process

| Learning | Context |
|----------|---------|
| **Daily sync is crucial** | 15 min/day saves hours of miscommunication |
| **Code freeze works** | No last-minute features = stable demo |
| **Documentation as you go** | Writing after the fact is painful |
| **Demo rehearsal** | Practice 2x before actual demo |

### Team

| Learning | Context |
|----------|---------|
| **Clear ownership** | Each feature has one owner |
| **Pair programming helps** | Complex features (Socket.IO) benefit từ 2 minds |
| **Celebrate small wins** | Sprint completion celebrations boost morale |

---

## Recommendations for Future Projects 💡

### For Similar Projects (3 people, 20 days)

1. **Week 1: Foundation**
   - Day 1-2: Planning, ERD, skeleton
   - Day 3-7: Core MVP features

2. **Week 2: Complete Features**
   - Day 8-14: All features done

3. **Week 3: Polish & Deliver**
   - Day 15-17: Testing, bugs
   - Day 18: Code freeze
   - Day 19-20: Deploy, demo

### Tools We'd Use Again
- ✅ NextJS + React
- ✅ NodeJS + Express
- ✅ Socket.IO
- ✅ PostgreSQL + Knex
- ✅ Stripe (test mode)
- ✅ Vercel + Render

### Tools We'd Add
- ➕ Jest/Vitest for unit tests
- ➕ Playwright for E2E tests
- ➕ GitHub Actions for CI/CD
- ➕ Sentry for error tracking

---

## Metrics

| Metric | Value |
|--------|-------|
| Total commits | XX |
| Pull requests | XX |
| Features delivered | 100% |
| Known bugs at demo | 0 critical |
| Demo outcome | ✅ Successful |

---

## Team Feedback

### Dev A (Team Lead)
> "Kinh nghiệm quý giá về project management. Daily standups thực sự hiệu quả."

### Dev B (Backend)
> "Socket.IO khó hơn expected nhưng rewarding. API-first approach save thời gian."

### Dev C (FE/QA)
> "Testing nên start sớm hơn. KDS feature là phần favorite."

---

*Document Version: 1.0 | Last Updated: 22/01/2026*
