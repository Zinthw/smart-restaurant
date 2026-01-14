# Sprint Planning - Smart Restaurant

## Sprint Overview

| Sprint | Days | Dates | Goal |
|--------|------|-------|------|
| Sprint 0 | 1-2 | 03-04/01 | Setup & Foundation |
| Sprint 1 | 3-7 | 05-09/01 | Guest Ordering MVP |
| Sprint 2 | 8-12 | 10-14/01 | KDS & Waiter Complete |
| Sprint 3 | 13-16 | 15-18/01 | Payment & Reports |
| Sprint 4 | 17-18 | 19-20/01 | Testing & Bug Fix |
| Sprint 5 | 19-20 | 21-22/01 | Deploy & Demo |

---

## Sprint 0: Setup & Foundation (Day 1-2)

**Goal:** Cả team hiểu scope, skeleton FE/BE chạy được

### Dev A (Team Lead / FE Customer)
- [ ] Đọc kỹ tất cả docs: PROJECT_DESCRIPTION, SELF_ASSESSMENT
- [ ] Tóm tắt scope, xác nhận features với team
- [ ] Review UI Mockups, xác định components cần build

### Dev B (Backend / Infra)
- [ ] Thiết kế ERD final
- [ ] Setup backend skeleton
- [ ] Setup database + migration scripts
- [ ] Tạo .env.example

### Dev C (FE Admin / QA)
- [ ] Setup frontend skeleton
- [ ] Test existing pages (Menu, Admin)
- [ ] Identify bugs cần fix

**Sprint 0 Deliverables:**
- ✅ Team aligned on scope
- ✅ Backend + Frontend running locally
- ✅ Database schema finalized

---

## Sprint 1: Guest Ordering MVP (Day 3-7)

**Goal:** Khách scan QR → xem menu → chọn món → gửi order → xem status

### Dev A
| Day | Task | Status |
|-----|------|--------|
| 3 | CartContext setup | [ ] |
| 3 | CartDrawer component | [ ] |
| 4 | Add to cart from Menu | [ ] |
| 4 | Cart item edit/remove | [ ] |
| 5 | Checkout page | [ ] |
| 6 | Order Status page | [ ] |
| 7 | Socket hook for updates | [ ] |

### Dev B
| Day | Task | Status |
|-----|------|--------|
| 3 | Socket.IO server setup | [ ] |
| 3 | Order events (create, update) | [ ] |
| 4 | Socket emit on order create | [ ] |
| 5 | Socket rooms per table | [ ] |
| 6 | Broadcast status changes | [ ] |
| 7 | Test full flow | [ ] |

### Dev C
| Day | Task | Status |
|-----|------|--------|
| 3 | Review Guest Menu UI | [ ] |
| 3 | Fix UI bugs | [ ] |
| 4 | Shared components | [ ] |
| 5 | Test Guest flow | [ ] |
| 6 | Write test cases | [ ] |
| 7 | Bug fixes | [ ] |

**Sprint 1 Deliverables:**
- ✅ Guest có thể add món vào cart
- ✅ Guest có thể submit order
- ✅ Guest có thể xem order status real-time

---

## Sprint 2: KDS & Waiter Complete (Day 8-12)

**Goal:** Kitchen và Waiter có thể xử lý order

### Dev A
| Day | Task | Status |
|-----|------|--------|
| 8-9 | Polish Cart UX | [ ] |
| 10 | Error handling | [ ] |
| 11-12 | Support testing + docs | [ ] |

### Dev B
| Day | Task | Status |
|-----|------|--------|
| 8 | Kitchen API: GET orders | [ ] |
| 9 | Kitchen API: PATCH status | [ ] |
| 10 | Socket for KDS | [ ] |
| 11 | Timer logic | [ ] |
| 12 | Waiter notifications | [ ] |

### Dev C
| Day | Task | Status |
|-----|------|--------|
| 8 | KDS page layout | [ ] |
| 9 | Order cards UI | [ ] |
| 10 | KDS real-time update | [ ] |
| 11 | Timer display | [ ] |
| 12 | Sound notifications | [ ] |

**Sprint 2 Deliverables:**
- ✅ Kitchen thấy order mới real-time
- ✅ Kitchen update status (preparing → ready)
- ✅ Waiter nhận notification

---

## Sprint 3: Payment & Reports (Day 13-16)

**Goal:** Thanh toán và báo cáo cơ bản

### Dev A
| Day | Task | Status |
|-----|------|--------|
| 13 | Payment page UI | [ ] |
| 14 | Bill summary | [ ] |
| 15 | Receipt display | [ ] |
| 16 | Payment flow test | [ ] |

### Dev B
| Day | Task | Status |
|-----|------|--------|
| 13 | Bill API | [ ] |
| 14 | Payment API | [ ] |
| 15 | Reports API: daily | [ ] |
| 16 | Reports API: top-items | [ ] |

### Dev C
| Day | Task | Status |
|-----|------|--------|
| 13 | Reports page layout | [ ] |
| 14 | KPI cards | [ ] |
| 15 | Revenue chart | [ ] |
| 16 | Top items table | [ ] |

**Sprint 3 Deliverables:**
- ✅ Guest xem bill và thanh toán
- ✅ Admin xem daily revenue
- ✅ Admin xem top-selling items

---

## Sprint 4: Testing & Bug Fix (Day 17-18)

**Goal:** Stabilize cho demo

### All Team
| Day | Task | Status |
|-----|------|--------|
| 17 | E2E test all flows | [ ] |
| 17 | Mobile responsiveness | [ ] |
| 18 | Security review | [ ] |
| 18 | Bug fixing | [ ] |
| 18 | **CODE FREEZE 6PM** | [ ] |

**Sprint 4 Deliverables:**
- ✅ All major bugs fixed
- ✅ Demo-ready state

---

## Sprint 5: Deploy & Demo (Day 19-20)

**Goal:** Production + Demo video

### Dev A
| Day | Task | Status |
|-----|------|--------|
| 19 | Demo script | [ ] |
| 19 | Rehearsal | [ ] |
| 20 | Record demo video | [ ] |
| 20 | Final docs | [ ] |

### Dev B
| Day | Task | Status |
|-----|------|--------|
| 19 | Deploy backend | [ ] |
| 19 | Deploy frontend | [ ] |
| 20 | Deployment runbook | [ ] |
| 20 | Seed production data | [ ] |

### Dev C
| Day | Task | Status |
|-----|------|--------|
| 19 | Final QA | [ ] |
| 19 | UI polish | [ ] |
| 20 | Self-Assessment | [ ] |
| 20 | Help demo | [ ] |

**Sprint 5 Deliverables:**
- ✅ App deployed & accessible
- ✅ Demo video recorded
- ✅ All docs completed

---

*Document Version: 1.0 | Last Updated: 03/01/2026*
