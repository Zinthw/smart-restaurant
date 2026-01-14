# Team Organization - Smart Restaurant

## Team Structure

```
                ┌─────────────────┐
                │     Dev A       │
                │   Team Lead     │
                │  FE Customer    │
                └────────┬────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────┴───────┐                 ┌───────┴───────┐
│    Dev B      │                 │    Dev C      │
│   Backend     │                 │   FE Admin    │
│    Infra      │                 │     QA        │
└───────────────┘                 └───────────────┘
```

---

## Team Members

| Member | Student ID | Role | Primary Focus | Git Username |
|--------|------------|------|---------------|--------------|
| Dev A | \<ID1\> | Team Lead | FE Customer, Demo, Coordination | \<username1\> |
| Dev B | \<ID2\> | Backend Lead | APIs, Socket.IO, Database, Deploy | \<username2\> |
| Dev C | \<ID3\> | FE Admin/QA | Admin UI, KDS, Testing | \<username3\> |

---

## Responsibilities Matrix (RACI)

> **R** = Responsible (Thực hiện)  
> **A** = Accountable (Chịu trách nhiệm)  
> **C** = Consulted (Được tham vấn)  
> **I** = Informed (Được thông báo)

| Task/Activity | Dev A | Dev B | Dev C |
|---------------|-------|-------|-------|
| **Project Management** |
| Sprint planning | R/A | C | C |
| Daily standup lead | R/A | I | I |
| Risk management | R/A | C | C |
| **Frontend - Customer** |
| Menu page | R/A | S | C |
| Cart & Checkout | R/A | C | I |
| Order Status | R/A | C | I |
| Payment page | R/A | C | I |
| **Frontend - Admin/Staff** |
| Admin Dashboard | C | I | R/A |
| Menu Management UI | C | I | R/A |
| Table & QR UI | C | I | R/A |
| Waiter Orders | C | I | R/A |
| Kitchen KDS | C | C | R/A |
| Reports UI | C | I | R/A |
| **Backend** |
| Database design | C | R/A | I |
| Auth APIs | I | R/A | C |
| Menu APIs | I | R/A | C |
| Order APIs | C | R/A | I |
| Socket.IO setup | I | R/A | C |
| Payment APIs | C | R/A | I |
| **Infrastructure** |
| Development setup | C | R/A | C |
| Deployment | I | R/A | I |
| CI/CD | I | R/A | I |
| **Quality Assurance** |
| Unit testing | C | R | R/A |
| E2E testing | C | C | R/A |
| Bug tracking | C | C | R/A |
| **Documentation** |
| Technical docs | C | R/A | C |
| User guide | R/A | C | C |
| Demo script | R/A | C | C |
| Self-assessment | R/A | C | C |

---

## Communication Plan

### Daily Standup
- **Time:** 9:00 AM (15 minutes)
- **Format:** What I did / What I'll do / Blockers
- **Channel:** Discord/Slack/Zalo

### Weekly Review
- **Day:** Every Monday
- **Duration:** 30 minutes
- **Focus:** Sprint review, blockers, planning

### Escalation Path
```
Issue/Blocker → Daily Standup → Team Discussion → Teacher (if needed)
```

---

## Working Agreements

1. **Code Review:** All PRs require 1 approval before merge
2. **Branch Naming:** `feature/xxx`, `fix/xxx`, `hotfix/xxx`
3. **Commit Messages:** Meaningful, prefix with `[FE]`, `[BE]`, `[DB]`
4. **Documentation:** Update relevant docs with each feature
5. **Response Time:** Reply within 4 hours during working hours

---

## Contact Information

| Member | Email | Phone | Available Hours |
|--------|-------|-------|-----------------|
| Dev A | \<email\> | \<phone\> | 9AM - 10PM |
| Dev B | \<email\> | \<phone\> | 9AM - 10PM |
| Dev C | \<email\> | \<phone\> | 9AM - 10PM |

---

*Document Version: 1.0 | Last Updated: 03/01/2026*
