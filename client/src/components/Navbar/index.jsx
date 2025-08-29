// client/src/Navbar.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const role = user?.role;
  const subRole = user?.subRole;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white px-6 py-4 shadow-md w-full">

      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold hover:underline">
          🏠 FindMySpace
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex md:items-center md:space-x-6 space-y-2 md:space-y-0 mt-4 md:mt-0 flex-col md:flex-row`}
        >
          <Link to="/" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>

          {isAuthenticated ? (
            <>
              {/* Owner */}
              {role === "owner" && (
                <>
                  <Link to="/rooms/new" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                    ➕ Post Room
                  </Link>
                  <Link to="/my-rooms" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                    🏡 My Rooms
                  </Link>
                  <Link to="/my-rooms/received" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                    📥 Received Bookings
                  </Link>
                </>
              )}
              {user?.role === "admin" && (
            <Link to="/admin/dashboard" className="text-sm px-4 py-2 hover:underline">
              Admin Panel
            </Link>
          )}


              {/* Seeker */}
              {role === "seeker" && (
                <>
                  <Link to="/rooms" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                    🔍 All Rooms
                  </Link>
                  <Link to="/my-bookings" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                    🗓️ My Bookings
                  </Link>
                </>
              )}

              {/* Roommate: hasRoom */}
              {role === "roommate" && subRole === "hasRoom" && (
                <>
                  {/* They may want to manage bookings for their room */}
                  <Link to="/my-rooms/received" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                    🗓️ Received Bookings
                  </Link>
                </>
              )}

              {/* Roommate: noRoom */}
              {role === "roommate" && subRole === "noRoom" && (
                <>
                  <Link to="/rooms" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                    🔍 All Rooms
                  </Link>
                  <Link to="/my-bookings" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                    🗓️ My Bookings
                  </Link>
                </>
              )}

              {/* Common for all logged-in users */}
              <Link to="/dashboard" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/chat" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                💬 Chat History
              </Link>
              <Link to="/my-page" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                <span className="bg-white text-indigo-600 px-3 py-1 rounded-full font-medium text-sm">
                  {user?.name}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Guest */}
              <Link to="/login" className="block hover:underline" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link
                to="/signup"
                className="block bg-white text-indigo-600 px-3 py-1 rounded font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
