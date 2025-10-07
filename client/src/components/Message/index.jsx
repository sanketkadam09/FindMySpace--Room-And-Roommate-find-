import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { io } from "socket.io-client";
import { API_URL } from "../../config";

const socket = io(`${API_URL}`|| "http://localhost:5000", {
  withCredentials: true,
});


const Message = () => {
  const { id } = useParams();
  const [me, setMe] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMe(data.info);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchOtherUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtherUser(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessages(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessage = () => {
    if (!content.trim()) return;
    socket.emit("sendMessage", {
      senderId: me._id,
      receiverId: id,
      content,
    });
    setMessages((prev) => [
      ...prev,
      {
        sender: me._id,
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
    setContent("");
  };

  useEffect(() => {
    fetchMe();
    fetchOtherUser();
    fetchMessages();
  }, []);

  useEffect(() => {
    if (me?._id) {
      socket.emit("register", me._id);
    }
  }, [me]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (msg.senderId === id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <Navbar user={me} onLogout={() => setMe(null)} />

      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 flex flex-col">
          <br></br><br></br>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">
            💬 Chat with {otherUser?.name || "..."}
          </h2>

          <div className="flex-1 overflow-y-auto max-h-[400px] mb-4 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-md w-fit max-w-[80%] ${
                  msg.sender === me?._id
                    ? "bg-indigo-100 ml-auto text-right"
                    : "bg-gray-200"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 mt-4">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded px-3 py-2"
              placeholder="Type your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Send
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2 bg-red-100 p-2 rounded">
              {error}
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Message;
