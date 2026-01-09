const express = require("express");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
require("dotenv").config();

const { initSocket } = require("./socket");
const {
  apiLimiter,
  authLimiter,
  orderLimiter,
} = require("./middleware/rateLimiter");

const tablesRouter = require("./routes/tables");
const qrRouter = require("./routes/qr");
const publicRouter = require("./routes/public");
const errorHandler = require("./middleware/errorHandler");
const authRouter = require("./routes/auth");
const {
  requireAuth,
  requireRole,
  requireCustomer,
  optionalCustomer,
} = require("./middleware/authMiddleware");
const categoriesRouter = require("./routes/categories");
const itemsRouter = require("./routes/items");
const path = require("path");
const photosRouter = require("./routes/photos");
const modifiersRouter = require("./routes/modifiers");
const ordersRouter = require("./routes/orders");
const waiterRouter = require("./routes/waiter");
const kitchenRouter = require("./routes/kitchen");
const paymentRouter = require("./routes/payment");
const reportsRouter = require("./routes/reports");
const reviewsRouter = require("./routes/reviews"); 
const usersRouter = require("./routes/users");

// New routes
const customerAuthRouter = require("./routes/customerAuth");
const customerRouter = require("./routes/customer");
const superadminRouter = require("./routes/superadmin");

const app = express();
const server = http.createServer(app);

initSocket(server);

// Security middleware
// app.use(helmet({
//   contentSecurityPolicy: false, // Disable for development, enable in production
//   crossOriginEmbedderPolicy: false
// }));

app.use(
  cors({
    origin: true, // Reflect request origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);
app.options("*", cors());
app.use(express.json());

// Apply general rate limiter to all API routes
app.use("/api/", apiLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Giúp truy cập ảnh qua link
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- ROUTES ---
app.use("/api/auth", authLimiter, authRouter);

// New Routes
app.use("/api/reviews", reviewsRouter); // Reviews (Public read, Private write)
app.use("/api/users", usersRouter);     // User Profile & Admin Management

// Admin Routes
app.use("/api/admin/tables", requireAuth, requireRole("admin"), tablesRouter);
app.use("/api/admin/tables", requireAuth, requireRole("admin"), qrRouter);
app.use(
  "/api/admin/menu/categories",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  categoriesRouter
);
app.use(
  "/api/admin/menu/items",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  photosRouter
);
app.use(
  "/api/admin/menu/items",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  itemsRouter
);
app.use(
  "/api/admin/menu",
  requireAuth,
  requireRole(["admin", "super_admin"]),
  modifiersRouter
);

// Role Routes
app.use(
  "/api/waiter",
  requireAuth,
  requireRole(["waiter", "admin", "super_admin"]),
  waiterRouter
);
app.use(
  "/api/kitchen",
  requireAuth,
  requireRole(["kitchen", "admin", "super_admin"]),
  kitchenRouter
);
app.use("/api/admin/reports", requireAuth, requireRole("admin"), reportsRouter);

// Public Routes
app.use("/api/qr", qrRouter); // QR verify (public)
app.use("/api/menu", optionalCustomer, publicRouter);
app.use("/api/menu", optionalCustomer, reviewsRouter); // Reviews (GET public, POST requires customer)
app.use("/api/orders", orderLimiter, optionalCustomer, ordersRouter); // Attach customer if logged in
app.use("/api/payment", optionalCustomer, paymentRouter);

// Customer Auth Routes (public)
app.use("/api/auth/customer", authLimiter, customerAuthRouter);

// Customer Profile Routes (requires customer login)
app.use("/api/customer", requireCustomer, customerRouter);

// Super Admin Routes
app.use(
  "/api/superadmin",
  requireAuth,
  requireRole("super_admin"),
  superadminRouter
);

app.use(errorHandler);

app.get("/test-cors", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>body{font-family:sans-serif;padding:20px}button{padding:10px 20px;font-size:16px;margin-bottom:10px}pre{background:#f4f4f4;padding:10px;overflow:auto}</style>
      </head>
      <body>
        <h1>Test Kết Nối (CORS)</h1>
        <p>IP Backend: 192.168.1.3:4000</p>
        <button onclick="test()">👉 Bấm vào đây để Test API</button>
        <div id="status">Chưa chạy</div>
        <pre id="result"></pre>
        <script>
          async function test() {
            const status = document.getElementById('status');
            const result = document.getElementById('result');
            status.innerText = 'Đang gọi API...';
            result.innerText = '';
            
            try {
              // Gọi chính API menu
              const res = await fetch('http://192.168.1.3:4000/api/menu/categories');
              if (!res.ok) throw new Error('Status: ' + res.status);
              
              const data = await res.json();
              status.innerText = '✅ Thành công!';
              status.style.color = 'green';
              result.innerText = JSON.stringify(data, null, 2);
            } catch (err) {
              status.innerText = '❌ Thất bại';
              status.style.color = 'red';
              result.innerText = 'Lỗi chi tiết: ' + err.message;
            }
          }
        </script>
      </body>
    </html>
  `);
});

const port = process.env.PORT || 4000;
const host = "0.0.0.0"; // Cho phép truy cập từ điện thoại qua IP

server.listen(port, host, () => {
  console.log(`🚀 Backend & Socket running on http://${host}:${port}`);
  console.log(`📱 Truy cập từ điện thoại: http://192.168.1.3:${port}`);
});
