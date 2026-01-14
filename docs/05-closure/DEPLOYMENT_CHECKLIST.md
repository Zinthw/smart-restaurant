# Deployment Checklist - Smart Restaurant

## Pre-Deployment Checklist

### Code Ready
- [ ] All features complete
- [ ] All tests passing
- [ ] No console.log() or debug code
- [ ] Code freeze announced (Day 18)
- [ ] Final code review done

### Environment Variables
- [ ] `.env.production` configured
- [ ] All secrets set on hosting platform
- [ ] Database credentials secure
- [ ] API keys valid

### Database
- [ ] Migrations run successfully
- [ ] Seed data prepared
- [ ] Backup created (if existing data)

---

## Deployment Steps

### 1. Backend Deployment (Render)

```bash
# 1. Push to GitHub (triggers auto-deploy)
git push origin main

# 2. Verify on Render dashboard
# https://dashboard.render.com

# 3. Set environment variables
DATABASE_URL=postgres://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
FRONTEND_URL=https://your-frontend.vercel.app
```

**Verification:**
- [ ] Backend accessible at https://your-app.onrender.com
- [ ] Health check endpoint returns 200
- [ ] Database connected

---

### 2. Frontend Deployment (Vercel)

```bash
# 1. Push to GitHub (triggers auto-deploy)
git push origin main

# 2. Verify on Vercel dashboard
# https://vercel.com/dashboard

# 3. Set environment variables
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

**Verification:**
- [ ] Frontend accessible at https://your-app.vercel.app
- [ ] Pages load without errors
- [ ] API calls work

---

### 3. Database Setup (Render PostgreSQL)

```bash
# 1. Create PostgreSQL instance on Render
# 2. Note connection string
# 3. Run migrations remotely

# Connect to remote DB
psql $DATABASE_URL

# Run migrations
npm run migrate:production
```

**Verification:**
- [ ] Tables created successfully
- [ ] Seed data inserted (if needed)

---

## Post-Deployment Checklist

### Functionality Tests

| Flow | Status |
|------|--------|
| Guest scan QR → Menu loads | [ ] |
| Add to cart | [ ] |
| Submit order | [ ] |
| Order status updates | [ ] |
| Admin login | [ ] |
| Waiter login | [ ] |
| KDS updates | [ ] |
| Payment works | [ ] |
| Reports load | [ ] |

### Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Home page load | < 3s | ___ s |
| API response | < 500ms | ___ ms |
| Socket connection | < 2s | ___ s |

### Mobile Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive layout works

---

## Rollback Plan

### If backend fails:
```bash
# Rollback to previous version on Render
# 1. Go to Render dashboard
# 2. Select previous deploy
# 3. Click "Redeploy"
```

### If frontend fails:
```bash
# Rollback on Vercel
# 1. Go to Vercel dashboard
# 2. Deployments tab
# 3. Select previous deploy
# 4. Click "Promote to Production"
```

---

## Live URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://smart-restaurant-xxx.vercel.app |
| **Backend** | https://smart-restaurant-api-xxx.onrender.com |
| **API Docs** | https://smart-restaurant-api-xxx.onrender.com/api-docs |

---

## Support Contacts

| Issue | Contact |
|-------|---------|
| Frontend issues | Dev A |
| Backend issues | Dev B |
| Database issues | Dev B |
| General | Dev A (Team Lead) |

---

*Document Version: 1.0 | Last Updated: 20/01/2026*
