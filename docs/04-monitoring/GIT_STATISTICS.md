# Git Statistics Report - Smart Restaurant

## Repository Information

| Item | Value |
|------|-------|
| **Repository** | smart-restaurant |
| **Report Period** | 03/01/2026 - 22/01/2026 |
| **Total Duration** | 20 days |
| **Main Branch** | main |

---

## Contributors Summary

| Avatar | Username | Student ID | Commits | Additions | Deletions | Files Changed |
|--------|----------|------------|---------|-----------|-----------|---------------|
| 👤 | \<git_username_1\> | \<StudentID1\> | XX | +XXXX | -XXX | XX |
| 👤 | \<git_username_2\> | \<StudentID2\> | XX | +XXXX | -XXX | XX |
| 👤 | \<git_username_3\> | \<StudentID3\> | XX | +XXXX | -XXX | XX |
| **Total** | | | **XX** | **+XXXX** | **-XXX** | **XX** |

---

## Commits Over Time

### Weekly Breakdown

| Week | Dates | Dev A | Dev B | Dev C | Total |
|------|-------|-------|-------|-------|-------|
| Week 1 | Jan 3-9 | XX | XX | XX | XX |
| Week 2 | Jan 10-16 | XX | XX | XX | XX |
| Week 3 | Jan 17-22 | XX | XX | XX | XX |
| **Total** | | **XX** | **XX** | **XX** | **XX** |

### Daily Activity

```
        Mon  Tue  Wed  Thu  Fri  Sat  Sun
Week 1: ▓▓▓  ▓▓   ▓▓▓▓ ▓▓▓  ▓▓▓▓ ▓    ▓
Week 2: ▓▓▓  ▓▓▓▓ ▓▓   ▓▓▓  ▓▓▓  ▓▓   ▓
Week 3: ▓▓▓▓ ▓▓▓  ▓▓▓▓ -    -    -    -
```

---

## Significant Commits

| Date | Author | Commit Message | Files | Lines |
|------|--------|----------------|-------|-------|
| 03/01 | Dev B | Initial project setup | 15 | +500 |
| 04/01 | Dev B | Database schema and migrations | 8 | +350 |
| 05/01 | Dev A | feat: Add CartContext and CartDrawer | 6 | +280 |
| 06/01 | Dev B | feat: Socket.IO server setup | 5 | +200 |
| 07/01 | Dev A | feat: Order status page with real-time | 8 | +450 |
| 10/01 | Dev C | feat: KDS page layout | 5 | +320 |
| 12/01 | Dev B | feat: Kitchen API endpoints | 6 | +380 |
| 14/01 | Dev C | feat: KDS real-time updates | 4 | +250 |
| 16/01 | Dev A | feat: Payment page with Stripe | 7 | +420 |
| 18/01 | Dev C | feat: Reports dashboard with charts | 6 | +380 |
| 20/01 | Dev B | deploy: Backend to Render | 3 | +100 |
| 21/01 | Dev A | docs: Final documentation | 10 | +800 |

---

## Branch Strategy

| Branch Type | Naming Convention | Example |
|-------------|-------------------|---------|
| Main | `main` | Production-ready |
| Development | `develop` | Integration |
| Feature | `feature/[name]` | `feature/cart` |
| Bug Fix | `fix/[name]` | `fix/socket-disconnect` |
| Hotfix | `hotfix/[name]` | `hotfix/payment-crash` |

### Active Branches

| Branch | Created By | Created Date | Merged Date | Status |
|--------|------------|--------------|-------------|--------|
| feature/cart | Dev A | 05/01 | 07/01 | ✅ Merged |
| feature/socket | Dev B | 05/01 | 07/01 | ✅ Merged |
| feature/kds | Dev C | 10/01 | 12/01 | ✅ Merged |
| feature/payment | Dev A | 14/01 | 16/01 | ✅ Merged |
| feature/reports | Dev C | 16/01 | 18/01 | ✅ Merged |

---

## Pull Requests

| PR # | Title | Author | Reviewers | Created | Merged | Status |
|------|-------|--------|-----------|---------|--------|--------|
| #1 | feat: Cart functionality | Dev A | Dev C | 06/01 | 07/01 | ✅ Merged |
| #2 | feat: Socket.IO setup | Dev B | Dev A | 06/01 | 07/01 | ✅ Merged |
| #3 | feat: Order submission | Dev A | Dev B | 08/01 | 09/01 | ✅ Merged |
| #4 | feat: KDS UI | Dev C | Dev A | 11/01 | 12/01 | ✅ Merged |
| #5 | feat: Waiter workflow | Dev C | Dev B | 13/01 | 14/01 | ✅ Merged |
| #6 | feat: Payment flow | Dev A | Dev C | 15/01 | 16/01 | ✅ Merged |
| #7 | feat: Reports | Dev C | Dev A | 17/01 | 18/01 | ✅ Merged |
| #8 | deploy: Production | Dev B | All | 19/01 | 20/01 | ✅ Merged |

---

## Code Review Statistics

| Reviewer | PRs Reviewed | Avg Review Time |
|----------|--------------|-----------------|
| Dev A | X | ~2 hours |
| Dev B | X | ~3 hours |
| Dev C | X | ~2 hours |

---

## Files by Type

| File Type | Count | Lines |
|-----------|-------|-------|
| JavaScript (.js) | XX | XXXX |
| TypeScript (.ts/.tsx) | XX | XXXX |
| CSS (.css/.scss) | XX | XXXX |
| Markdown (.md) | XX | XXXX |
| JSON | XX | XXXX |
| SQL | XX | XXXX |

---

## How to Generate This Report

```bash
# Total commits by author
git shortlog -sn --all

# Commits in date range
git log --oneline --after="2026-01-03" --before="2026-01-23"

# Lines added/deleted by author
git log --author="username" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2 } END { printf "added: %s, removed: %s\n", add, subs }'

# Files changed by author
git log --author="username" --oneline | wc -l
```

---

*Document Version: 1.0 | Last Updated: 22/01/2026*
*Note: Fill in actual statistics from git log before submission*
