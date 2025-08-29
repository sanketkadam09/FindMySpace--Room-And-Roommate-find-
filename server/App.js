/**
 * App.js (entry point)
 * Updated to use modular route structure.
 */

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const roomRoutes = require("./routes/roomRoutes");
const matchRoutes = require("./routes/matchRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const contactRoutes = require("./routes/contact");
// const adminRoutes = require('./routes/adminRoutes')
const app = express();

// ✅ Middleware
app.use(express.json());  
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ API Routes
app.use("/api", authRoutes);
app.use("/api/users", userRoutes); // ✨ UPDATED: Changed from /api/user to /api/users
app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", contactRoutes);
// app.use('/api/admin', adminRoutes);



// ✅ Socket.io Setup
const Message = require("./Message");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

const onlineUsers = new Map();
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
    const newMessage = new Message({ sender: senderId, receiver: receiverId, content });
    await newMessage.save();

    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", {
        senderId,
        content,
        timestamp: newMessage.timestamp,
      });
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});