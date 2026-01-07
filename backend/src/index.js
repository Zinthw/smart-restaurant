const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const { initSocket } = require("./socket");

const tablesRouter = require("./routes/tables");
const qrRouter = require("./routes/qr");
const publicRouter = require("./routes/public");
const errorHandler = require("./middleware/errorHandler");
const authRouter = require("./routes/auth");
const { requireAuth, requireRole } = require("./middleware/authMiddleware");
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

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Giúp truy cập ảnh qua link
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- ROUTES ---
app.use("/api/auth", authRouter);

// New Routes
app.use("/api/reviews", reviewsRouter); // Reviews (Public read, Private write)
app.use("/api/users", usersRouter);     // User Profile & Admin Management

// Admin Routes
app.use("/api/admin/tables", requireAuth, requireRole("admin"), tablesRouter);
app.use("/api/admin/tables", requireAuth, requireRole("admin"), qrRouter);
app.use("/api/admin/menu/categories", requireAuth, requireRole("admin"), categoriesRouter);
app.use("/api/admin/menu/items", requireAuth, requireRole("admin"), photosRouter);
app.use("/api/admin/menu/items", requireAuth, requireRole("admin"), itemsRouter);
app.use("/api/admin/menu", requireAuth, requireRole("admin"), modifiersRouter);

// Role Routes
app.use("/api/waiter", requireAuth, requireRole(["waiter", "admin"]), waiterRouter);
app.use("/api/kitchen", requireAuth, requireRole(["kitchen", "admin"]), kitchenRouter); 
app.use("/api/admin/reports", requireAuth, requireRole("admin"), reportsRouter); 

// Public Routes
app.use("/api/menu", publicRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payment", paymentRouter); 

app.use(errorHandler);

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`🚀 Backend & Socket running on port ${port}`);
});
