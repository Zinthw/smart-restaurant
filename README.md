# 🍽️ Smart Restaurant Management System

A comprehensive restaurant management system with QR-based menu ordering, admin dashboard, and real-time inventory management.

## 📋 Overview

Smart Restaurant is a full-stack web application designed to modernize restaurant operations. It features:

- **Guest Menu**: QR code scanning for contactless menu browsing
- **Admin Dashboard**: Complete menu, category, modifier, and table management
- **Real-time Updates**: Inventory tracking with status management (available/sold out)
- **Photo Management**: Multiple photo support with primary image selection
- **Customization**: Modifier groups for item variations (size, toppings, sugar levels, etc.)

## 🚀 Tech Stack

### Backend

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL (Render/pgAdmin)
- **Authentication**: JWT + bcrypt
- **File Handling**: Multer for image uploads

### Frontend

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **UI/UX**: Custom CSS with responsive design
- **Notifications**: React Hot Toast

### Deployment

- **Backend**: Render (https://your-backend.onrender.com)
- **Frontend**: Vercel (https://your-frontend.vercel.app)
- **Database**: Render PostgreSQL

## 📁 Project Structure

```
smart-restaurant/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.js      # Login/register
│   │   │   ├── tables.js    # Table management
│   │   │   ├── qr.js        # QR code generation
│   │   │   ├── categories.js
│   │   │   ├── items.js
│   │   │   ├── modifiers.js
│   │   │   ├── photos.js
│   │   │   └── public.js    # Guest menu API
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── uploadMiddleware.js
│   │   ├── db.js           # PostgreSQL connection
│   │   └── index.js        # Express app entry
│   ├── migrate.js          # Database migrations
│   ├── database.sql        # Schema definition
│   └── package.json
│
├── docs/                   # Project and API documentation (see docs/API_DOCUMENTATION.md)
│   └── API_DOCUMENTATION.md
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Login/
│   │   │   │   ├── Menu/
│   │   │   │   │   ├── Items.jsx
│   │   │   │   │   ├── Categories.jsx
│   │   │   │   │   └── Modifiers.jsx
│   │   │   │   └── Tables/
│   │   │   └── Guest/
│   │   │       ├── Login/
│   │   │       └── Menu/
│   │   ├── api/
│   │   │   ├── axiosClient.js
│   │   │   ├── auth.api.js
│   │   │   ├── menu.api.js
│   │   │   └── tables.api.js
│   │   ├── components/
│   │   └── utils/
│   ├── vercel.json         # Vercel SPA config
│   └── package.json
│
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites

- Node.js v16+ and npm
- PostgreSQL database (local or cloud)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/your-username/smart-restaurant.git
cd smart-restaurant
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@host:port/database
QR_JWT_SECRET=your-secret-key-here
CLIENT_BASE_URL=http://localhost:5173
PORT=4000
NODE_ENV=development
```

Run migration:

```bash
node migrate.js
```

Start server:

```bash
npm start          # Production
npm run dev        # Development with nodemon
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:4000/api
```

Start development server:

```bash
npm run dev
```

Access at: http://localhost:5173

### 4. Default Admin Account

```
Email: admin@restaurant.com
Password: admin123
```

## 🗄️ Database Schema

Key tables:

- `users` - Admin/staff authentication
- `tables` - Restaurant table management
- `menu_categories` - Menu organization
- `menu_items` - Food/drink items with prep time, price, status
- `menu_item_photos` - Multiple photos per item
- `modifier_groups` - Customization categories (Size, Toppings, etc.)
- `modifier_options` - Individual options with price adjustments
- `menu_item_modifier_groups` - Many-to-many relationship

## 🔑 Environment Variables

### Backend

| Variable          | Description                  | Example                       |
| ----------------- | ---------------------------- | ----------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string | `postgresql://...`            |
| `QR_JWT_SECRET`   | Secret for QR token signing  | `random-secure-string`        |
| `CLIENT_BASE_URL` | Frontend URL for CORS        | `https://your-app.vercel.app` |
| `PORT`            | Server port                  | `4000`                        |

### Frontend

| Variable       | Description          | Example                             |
| -------------- | -------------------- | ----------------------------------- |
| `VITE_API_URL` | Backend API endpoint | `https://your-api.onrender.com/api` |

## 📡 API Endpoints

### Public Routes (Guest)

- `GET /api/menu` - Get full menu with categories, items, modifiers

### Admin Routes (Auth Required)

**Authentication**

- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin

**Tables**

- `GET /api/admin/tables` - List all tables
- `POST /api/admin/tables` - Create table
- `PUT /api/admin/tables/:id` - Update table
- `DELETE /api/admin/tables/:id` - Delete table
- `POST /api/admin/tables/:id/qr` - Generate QR code

**Categories**

- `GET /api/admin/menu/categories`
- `POST /api/admin/menu/categories`
- `PUT /api/admin/menu/categories/:id`
- `PATCH /api/admin/menu/categories/:id/status`

**Items**

- `GET /api/admin/menu/items?sort_by=popularity&page=1&limit=10`
- `POST /api/admin/menu/items`
- `PUT /api/admin/menu/items/:id`
- `DELETE /api/admin/menu/items/:id` (soft delete)
- `PATCH /api/admin/menu/items/:id/status`

**Photos**

- `POST /api/admin/menu/items/:id/photos` - Upload files
- `POST /api/admin/menu/items/:id/photos/from-url` - Add from URL
- `PATCH /api/admin/menu/items/:id/photos/:photoId/primary` - Set primary
- `DELETE /api/admin/menu/items/:id/photos/:photoId`

**Modifiers**

- `GET /api/admin/menu/modifier-groups`
- `POST /api/admin/menu/modifier-groups`
- `POST /api/admin/menu/modifier-groups/:id/options`
- `POST /api/admin/menu/items/:id/modifier-groups` - Attach to item

## 🚢 Deployment

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Branch**: `integration` or `main`
4. Add environment variables (DATABASE_URL, QR_JWT_SECRET, etc.)
5. Deploy will auto-run `migrate.js`

### Frontend (Vercel)

1. Import project from GitHub
2. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable: `VITE_API_URL`
4. Deploy

### Database (Render PostgreSQL)

1. Create PostgreSQL instance on Render
2. Copy **External Database URL**
3. Use in backend `DATABASE_URL`
4. Connect via pgAdmin for management

## 🎯 Features

### Admin Dashboard

- ✅ Menu item CRUD with photos
- ✅ Category management with status control
- ✅ Modifier groups with options
- ✅ Table management with QR generation
- ✅ Prep time tracking (0-240 minutes)
- ✅ Popularity sorting by order count
- ✅ Multi-image support with primary selection
- ✅ Status management (active/sold out/inactive)

### Guest Menu

- ✅ QR code scanning for menu access
- ✅ Category filtering
- ✅ Real-time availability status
- ✅ Modifier selection with price preview
- ✅ Responsive mobile design
- ✅ Image fallback handling

## 📝 Development Notes

- Backend uses soft delete (`deleted_at`) for menu items
- Photos can be uploaded locally or via URL (URL recommended for Render)
- JWT tokens for QR codes expire after 24 hours
- Authorization header only attached for `/admin` routes
- SPA routing handled via `vercel.json` rewrites

## 🐛 Troubleshooting

**404 on guest menu routes**

- Verify `vercel.json` has SPA rewrite rule
- Check `VITE_API_URL` points to backend `/api`

**Images not loading**

- Use full URLs for photo_url (not relative `/uploads`)
- Verify backend CORS allows frontend origin

**Database column errors**

- Run `node migrate.js` to update schema
- Check PostgreSQL version compatibility

## 👥 Team

Final Project - Web Development Course

## 📄 License

MIT License - Feel free to use for learning purposes.
