import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BookingForm = () => {
  const { id } = useParams(); // roomId
  const navigate = useNavigate();

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBooking = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError("❌ Check-out date must be after check-in date.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          checkInDate,
          checkOutDate,
          guests,
          message,
          fullName,
          phone,
          email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("✅ Room booked successfully!");
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (err) {
      setError(err.message || "Booking failed.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-xl mx-auto p-6 mt-6 bg-white rounded shadow">
        <br></br><br></br>
        <h2 className="text-2xl font-bold mb-4">📝 Book This Room</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <form onSubmit={handleBooking}>
          <label className="block mb-2 font-medium">Check-in Date:</label>
          <input
            type="date"
            className="w-full border p-2 rounded mb-4"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            required
          />

          <label className="block mb-2 font-medium">Check-out Date:</label>
          <input
            type="date"
            className="w-full border p-2 rounded mb-4"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            required
          />

          <label className="block mb-2 font-medium">Guests:</label>
          <input
            type="number"
            min="1"
            className="w-full border p-2 rounded mb-4"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
          />

          <label className="block mb-2 font-medium">Additional Message:</label>
          <textarea
            className="w-full border p-2 rounded mb-4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />

          <label className="block mb-2 font-medium">Full Name:</label>
          <input
            type="text"
            className="w-full border p-2 rounded mb-4"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <label className="block mb-2 font-medium">Phone:</label>
          <input
            type="tel"
            className="w-full border p-2 rounded mb-4"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <label className="block mb-2 font-medium">Email:</label>
          <input
            type="email"
            className="w-full border p-2 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Book Room
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default BookingForm;