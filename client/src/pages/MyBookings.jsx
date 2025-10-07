import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_URL } from "../config";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const fetchMyBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/me`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirm = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirm) return;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Remove from UI
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      alert("❌ Cancel failed: " + err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen mt-10">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-4xl mx-auto mt-6 p-4 bg-white shadow rounded">
          <br></br><br></br>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">📋 My Bookings</h2>
            {error && <p className="text-red-500">{error}</p>}
            {bookings.length === 0 ? (
              <p className="text-gray-600">No bookings found.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Link to={`/room/${booking.room?._id}`} key={booking._id} className="block border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image Container */}
                      <div className="w-full sm:w-48 flex-shrink-0">
                        {booking.room?.photos?.length > 0 ? (
                          <img src={booking.room.photos[0]} alt={booking.room.title || 'Room image'} className="w-full h-40 object-cover rounded-md" />
                        ) : (
                          <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-500 text-sm">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Details Container */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800">{booking.room?.title || "Unknown Room"}</h3>
                        <p className="text-sm text-gray-600 mt-1">📍 {booking.room?.location || "N/A"}</p>
                        <p className="text-lg font-bold text-indigo-600 mt-1">₹{booking.room?.price || "N/A"}</p>
                        <p className="text-sm mt-2 text-gray-700 bg-gray-50 p-2 rounded">
                          📝 {booking.message || "No message provided"}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={(e) => { e.preventDefault(); handleCancel(booking._id); }}
                            className="text-red-500 hover:text-red-700 font-semibold text-sm"
                          >
                            ❌ Cancel Booking
                          </button>
                          <p className="text-xs text-gray-400">
                            📅 Booked on: {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default MyBookings;
