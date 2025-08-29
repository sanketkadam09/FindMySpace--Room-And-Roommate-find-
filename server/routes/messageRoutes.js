const express = require("express");
const router = express.Router();
const { jsonwebtoken } = require("../middleware/JwtAuth");
const validateMessage = (req, res, next) => {
  console.log("🔥 validateMessage received:", req.body); // 👈 log incoming body

  const { receiverId, content } = req.body;
  if (!receiverId || !content) {
    return res.status(400).json({ message: "receiverId and content are required" });
  }
  next();
};



const {
  getChats,
  getMessagesWithUser,
  sendMessage,
  markAsRead,
} = require("../controllers/messageController");

router.get("/chats", jsonwebtoken, getChats);
router.get("/:id", jsonwebtoken, getMessagesWithUser);
router.post("/", jsonwebtoken,validateMessage, sendMessage);
router.put("/:id/read", jsonwebtoken, markAsRead);

module.exports = router;
