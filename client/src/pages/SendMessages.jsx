// src/pages/SendMessage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SendMessage = () => {
  const { id } = useParams(); // Receiver user ID from the route
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendMessage = async () => {
    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          receiverId: id,
          content: message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send message");

      alert("Message sent successfully!");
      navigate(`/message/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">
          Send a Message
        </h2>
        <textarea
          rows="4"
          className="w-full border border-gray-300 rounded p-2 mb-4"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError(""); // Clear error when user starts typing again
          }}
          placeholder="Type your message here..."
        />
        <button
          disabled={!message.trim()}
          onClick={sendMessage}
          className={`w-full px-4 py-2 rounded ${
            message.trim()
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Send Message
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-2 bg-red-100 p-2 rounded">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default SendMessage;
