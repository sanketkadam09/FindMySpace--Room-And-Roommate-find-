import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Navbar from "../Navbar";
import Footer from "../Footer";

const socket = io(`${process.env.REACT_APP_API_URL}`, {
  withCredentials: true,
});

const ChatHistory = () => {
  const [chats, setChats] = useState([]);
  const [user_Id, setUserId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sortChats = (list) =>
    list.slice().sort(
      (a, b) =>
        new Date(b.lastTimestamp).getTime() -
        new Date(a.lastTimestamp).getTime()
    );

  const fetchChats = async () => {
    try {
      // ✅ CORRECTED ENDPOINT
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/chats`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setChats(sortChats(data));
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUserId(data.info._id);
        socket.emit("register", data.info._id);
      }
    } catch (err) {
      console.error("Failed to get user:", err);
    }
  };

  const handleChatOpen = async (chatId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/messages/${chatId}/read`, {
        method: "PUT",
        credentials: "include",
      });

      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
        );
        return sortChats(updated);
      });

      navigate(`/message/${chatId}`);
    } catch (err) {
      console.error("Read mark failed:", err);
      navigate(`/message/${chatId}`);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchChats();

    socket.on("receiveMessage", ({ senderId, content, timestamp }) => {
      setChats((prevChats) => {
        const updated = [...prevChats];
        const index = updated.findIndex((chat) => chat._id === senderId);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            lastMessage: content,
            lastTimestamp: timestamp,
            unreadCount: updated[index].unreadCount + 1,
          };
        } else {
          updated.push({
            _id: senderId,
            name: "New User",
            lastMessage: content,
            lastTimestamp: timestamp,
            unreadCount: 1,
          });
        }

        return sortChats(updated);
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  return (
    <>
      <Navbar user={{ name: "You" }} />
      <div className="min-h-screen bg-gray-100 py-10 px-4 mt-5">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 mt-3">
          <br></br><br></br><br></br>
          <h2 className="text-xl font-bold text-indigo-700 mb-6">💬 Chat History</h2>
          {error && (
            <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>
          )}
          {chats.length === 0 ? (
            <p className="text-gray-600 text-sm">No chats yet.</p>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => {
                const imageUrl = chat.profileImage
                  ? `${process.env.REACT_APP_API_URL}${chat.profileImage}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}`;

                return (
                  <div
                    key={chat._id}
                    onClick={() => handleChatOpen(chat._id)}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition hover:bg-indigo-50 ${
                      chat.unreadCount
                        ? "bg-indigo-100 border-l-4 border-indigo-500"
                        : "bg-white"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">{chat.name}</h3>
                        <span className="text-xs text-gray-400">
                          {chat.lastTimestamp
                            ? new Date(chat.lastTimestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChatHistory;
