const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Cho phép mọi origin (dev), production nên set cụ thể
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // Join room theo bàn (Khách)
    socket.on("join:table", (tableId) => {
      socket.join(`table:${tableId}`);
      console.log(`Socket ${socket.id} joined table:${tableId}`);
    });

    // Join room theo role (Bếp, Waiter)
    socket.on("join:role", (role) => {
      if (['waiter', 'kitchen', 'admin'].includes(role)) {
        socket.join(`role:${role}`);
        console.log(`Socket ${socket.id} joined role:${role}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Hàm tiện ích để emit sự kiện từ bất cứ đâu
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };