# Work Breakdown Structure (WBS) - Smart Restaurant

## Project Summary

```
Smart Restaurant System (100%)
├── 1. Guest Ordering (30%)
├── 2. Admin Panel (25%)
├── 3. Staff Operations (25%)
├── 4. Infrastructure (15%)
└── 5. Documentation & Delivery (5%)
```

---

## Detailed WBS

### 1. Guest Ordering (30%) - Dev A Primary

| ID | Task | Story Points | Owner | Sprint |
|----|------|--------------|-------|--------|
| 1.1 | QR Scan & Table Session | 3 | Dev B | 1 |
| 1.2 | Menu Display Page | 5 | Dev A | 1 |
| 1.3 | Menu Item Filter/Search | 3 | Dev A | 1 |
| 1.4 | Menu Item Detail | 3 | Dev A | 1 |
| 1.5 | Cart Context & Drawer | 5 | Dev A | 1 |
| 1.6 | Cart Item Management | 3 | Dev A | 1 |
| 1.7 | Checkout Flow | 5 | Dev A | 2 |
| 1.8 | Order Status Page | 5 | Dev A | 2 |
| 1.9 | Add More Items to Order | 3 | Dev A | 2 |
| 1.10 | Request Bill | 2 | Dev A | 4 |
| 1.11 | Payment Page | 5 | Dev A | 4 |
| **Total** | | **42 SP** | | |

---

### 2. Admin Panel (25%) - Dev C Primary

| ID | Task | Story Points | Owner | Sprint |
|----|------|--------------|-------|--------|
| 2.1 | Admin Login Page | 3 | Dev C | 1 |
| 2.2 | Admin Dashboard | 5 | Dev C | 2 |
| 2.3 | Menu Categories CRUD | 5 | Dev C | 2 |
| 2.4 | Menu Items CRUD | 5 | Dev C | 2 |
| 2.5 | Menu Modifiers | 3 | Dev C | 2 |
| 2.6 | Table Management | 3 | Dev C | 2 |
| 2.7 | QR Code Generation | 3 | Dev B | 2 |
| 2.8 | Staff Account Management | 3 | Dev C | 3 |
| 2.9 | Reports - Daily Revenue | 5 | Dev C | 4 |
| 2.10 | Reports - Top Items | 3 | Dev C | 4 |
| **Total** | | **38 SP** | | |

---

### 3. Staff Operations (25%) - Dev B + Dev C

| ID | Task | Story Points | Owner | Sprint |
|----|------|--------------|-------|--------|
| 3.1 | Waiter Login | 2 | Dev C | 2 |
| 3.2 | Waiter Orders List | 5 | Dev C | 3 |
| 3.3 | Accept/Reject Orders | 3 | Dev C | 3 |
| 3.4 | Mark as Served | 2 | Dev C | 3 |
| 3.5 | Kitchen Staff Login | 2 | Dev C | 3 |
| 3.6 | KDS Page Layout | 5 | Dev C | 3 |
| 3.7 | KDS Real-time Updates | 5 | Dev B | 3 |
| 3.8 | KDS Timer & Alerts | 3 | Dev C | 3 |
| 3.9 | Sound Notifications | 2 | Dev C | 3 |
| **Total** | | **29 SP** | | |

---

### 4. Infrastructure (15%) - Dev B Primary

| ID | Task | Story Points | Owner | Sprint |
|----|------|--------------|-------|--------|
| 4.1 | Database Design | 5 | Dev B | 0 |
| 4.2 | Auth APIs (JWT) | 5 | Dev B | 1 |
| 4.3 | Menu APIs | 5 | Dev B | 1 |
| 4.4 | Order APIs | 5 | Dev B | 1 |
| 4.5 | Socket.IO Setup | 5 | Dev B | 1 |
| 4.6 | Kitchen APIs | 3 | Dev B | 3 |
| 4.7 | Payment APIs | 5 | Dev B | 4 |
| 4.8 | Reports APIs | 3 | Dev B | 4 |
| 4.9 | Deployment | 5 | Dev B | 5 |
| **Total** | | **41 SP** | | |

---

### 5. Documentation & Delivery (5%) - Dev A Lead

| ID | Task | Story Points | Owner | Sprint |
|----|------|--------------|-------|--------|
| 5.1 | API Documentation | 3 | Dev B | 4 |
| 5.2 | User Guide | 2 | Dev A | 5 |
| 5.3 | Self-Assessment | 2 | All | 5 |
| 5.4 | Demo Script | 2 | Dev A | 5 |
| 5.5 | Demo Video Recording | 3 | Dev A | 5 |
| **Total** | | **12 SP** | | |

---

## Summary by Owner

| Owner | Total Story Points | Percentage |
|-------|-------------------|------------|
| Dev A | ~52 SP | 32% |
| Dev B | ~54 SP | 33% |
| Dev C | ~56 SP | 35% |
| **Total** | **162 SP** | **100%** |

---

## Summary by Sprint

| Sprint | Days | Story Points | Focus |
|--------|------|--------------|-------|
| Sprint 0 | 1-2 | 15 SP | Setup, Database |
| Sprint 1 | 3-7 | 40 SP | Guest Menu, Cart, Orders |
| Sprint 2 | 8-12 | 35 SP | Admin, Checkout |
| Sprint 3 | 13-16 | 30 SP | KDS, Waiter |
| Sprint 4 | 17-18 | 25 SP | Payment, Reports |
| Sprint 5 | 19-20 | 17 SP | Deploy, Demo |

---

*Document Version: 1.0 | Last Updated: 03/01/2026*
