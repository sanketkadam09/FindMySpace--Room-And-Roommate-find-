const Message = require("../Message");

exports.getChats = async (req, res) => {
  try {
    const myId = req.payload.id;
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    }).populate("sender receiver");

    const chatMap = new Map();
    messages.forEach((msg) => {
      const other = msg.sender._id.toString() === myId ? msg.receiver : msg.sender;
      const id = other._id.toString();

      if (!chatMap.has(id)) {
        chatMap.set(id, {
          _id: other._id,
          name: other.name,
          profileImage: other.profileImage,
          lastMessage: msg.content,
          lastTimestamp: msg.timestamp,
          unreadCount: 0,
        });
      }

      const current = chatMap.get(id);
      if (msg.timestamp > current.lastTimestamp) {
        current.lastMessage = msg.content;
        current.lastTimestamp = msg.timestamp;
      }
      if (!msg.read && msg.sender._id.toString() === other._id.toString()) {
        current.unreadCount++;
      }
      chatMap.set(id, current);
    });

    const result = Array.from(chatMap.values()).sort(
      (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chat history", error: err });
  }
};



exports.getMessagesWithUser = async (req, res) => {
  const { page = 1, limit = 20 } = req.query; // Read page and limit from query
  const skip = (page - 1) * limit;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.payload.id, receiver: req.params.id },
        { sender: req.params.id, receiver: req.payload.id },
      ],
    })
      .sort({ timestamp: 1 }) // older messages first
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err });
  }
};

exports.sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.payload.id;

  console.log("📩 Incoming message:", { senderId, receiverId, content });

  if (!receiverId || !content) {
    return res.status(400).json({ message: "Receiver ID and content are required" });
  }

  try {
    const message = new Message({ sender: senderId, receiver: receiverId, content });
    await message.save();
    res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err });
  }
};


exports.markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.id, receiver: req.payload.id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark messages as read", error: err });
  }
};
