# Technical Decisions (ADR) - Smart Restaurant

## ADR-001: Frontend Framework Selection

**Date:** 03/01/2026  
**Status:** Accepted  
**Deciders:** All team

### Context
Cần chọn framework cho frontend.

### Decision
Sử dụng **NextJS** với React.

### Rationale
- Có base code sẵn từ existing project
- SSR support nếu cần
- File-based routing đơn giản
- Team đã quen với React

### Consequences
- ✅ Fast development
- ⚠️ Cần hiểu NextJS routing

---

## ADR-002: State Management

**Date:** 03/01/2026  
**Status:** Accepted  
**Deciders:** Dev A

### Context
Cần quản lý cart state và user session.

### Decision
Sử dụng **React Context + useReducer** cho cart, không dùng Redux.

### Rationale
- Cart state không quá phức tạp
- Giảm boilerplate
- Built-in React, không cần thư viện ngoài

### Consequences
- ✅ Simple implementation
- ⚠️ Không có devtools như Redux

---

## ADR-003: Real-time Communication

**Date:** 03/01/2026  
**Status:** Accepted  
**Deciders:** Dev B

### Context
Cần real-time updates cho KDS, order status.

### Decision
Sử dụng **Socket.IO**.

### Rationale
- Fallback to polling tự động
- Documentation tốt
- Đã có experience

### Consequences
- ✅ Reliable real-time
- ⚠️ Setup complexity

---

## ADR-004: Database Choice

**Date:** 03/01/2026  
**Status:** Accepted  
**Deciders:** Dev B

### Context
Cần database cho backend.

### Decision
Sử dụng **PostgreSQL** với Knex.js.

### Rationale
- Relational data (menu, orders)
- Knex migrations đã setup
- Free tier trên Railway/Render

### Consequences
- ✅ ACID compliance
- ✅ JSON support for modifiers

---

## ADR-005: Authentication Strategy

**Date:** 03/01/2026  
**Status:** Accepted  
**Deciders:** Dev B

### Context
Cần auth cho Admin, Waiter, Kitchen staff.

### Decision
**JWT + Passport.js** với roles.

### Rationale
- Stateless
- Easy role-based access
- Project requirement

### Consequences
- ✅ Scalable
- ⚠️ Token refresh handling

---

## ADR-006: Payment Integration

**Date:** 13/01/2026  
**Status:** Accepted  
**Deciders:** Dev A, Dev B

### Context
Cần payment integration cho project.

### Decision
Sử dụng **Stripe** với test mode.

### Rationale
- Great documentation
- Test mode không cần production credentials
- React components available

### Consequences
- ✅ Easy integration
- ⚠️ Demo with test cards only

---

## ADR-007: Deployment Platform

**Date:** 17/01/2026  
**Status:** Accepted  
**Deciders:** Dev B

### Context
Cần deploy app lên public URL.

### Decision
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Render PostgreSQL

### Rationale
- Free tier đủ cho demo
- Easy deployment
- No configuration needed

### Consequences
- ✅ Quick deployment
- ⚠️ Cold start on free tier

---

## ADR-008: Styling Approach

**Date:** 03/01/2026  
**Status:** Accepted  
**Deciders:** Dev A, Dev C

### Context
Cần consistent styling cho UI.

### Decision
Sử dụng **CSS Modules** + custom design system.

### Rationale
- No build time issues
- Scoped styles
- Existing code uses it

### Consequences
- ✅ Easy to understand
- ⚠️ Some duplicate styles

---

*Document Version: 1.0 | Last Updated: 03/01/2026*
