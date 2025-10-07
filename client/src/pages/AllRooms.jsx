import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_URL } from "../config";

const AllRooms = () => {
  const [filters, setFilters] = useState({
    location: "",
    preference: "",
    minPrice: "",
    maxPrice: "",
  });
  const [rooms, setRooms] = useState([]);
  const [imageIndices, setImageIndices] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextImage = (e, roomId, totalImages) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndices((prev) => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) + 1) % totalImages,
    }));
  };

  const handlePrevImage = (e, roomId, totalImages) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndices((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) - 1 < 0 ? totalImages - 1 : (prev[roomId] || 0) - 1,
    }));
  };

  const getImageUrl = (room, index = 0) => {
    const defaultPlaceholder = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80";
    if (room.images && room.images.length > 0 && room.images[index]?.url) {
      const imageUrl = room.images[index].url;
      return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
    }
    return defaultPlaceholder;
  };

  const fetchRooms = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsLoading(true);
      const { location, preference, minPrice, maxPrice } = filters;
      const query = new URLSearchParams({
        ...(location && { location }),
        ...(preference && { preference }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      }).toString();

      const res = await fetch(`${API_URL}/api/rooms?${query}`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch rooms");

      setRooms(data);
      const initialIndices = {};
      data.forEach((room) => {
        initialIndices[room._id] = 0;
      });
      setImageIndices(initialIndices);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <br></br><br></br>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Space
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover comfortable and affordable living spaces that match your lifestyle
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Search Filters</h2>
          
          <form onSubmit={fetchRooms} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    placeholder="City, Area, or Landmark"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Preference */}
              <div>
                <label htmlFor="preference" className="block text-sm font-medium text-gray-700 mb-2">
                  Preference
                </label>
                <select
                  id="preference"
                  name="preference"
                  value={filters.preference}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"
                >
                  <option value="">All Preferences</option>
                  <option value="student">Student</option>
                  <option value="working">Working Professional</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="minPrice"
                    id="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="block w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                    min="0"
                  />
                </div>
              </div>

              {/* Max Price */}
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="maxPrice"
                    id="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="block w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                    min={filters.minPrice || "0"}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    location: "",
                    preference: "",
                    minPrice: "",
                    maxPrice: "",
                  });
                  fetchRooms();
                }}
                className="mr-3 inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isLoading ? 'Loading...' : `${rooms.length} ${rooms.length === 1 ? 'Room' : 'Rooms'} Available`}
          </h2>
          <div className="text-sm text-gray-500">
            Sorted by: <span className="font-medium">Best Match</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No rooms found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {Object.values(filters).some(Boolean)
                ? 'Try adjusting your search filters or remove some filters.'
                : 'No rooms are currently available. Please check back later.'}
            </p>
            {Object.values(filters).some(Boolean) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    location: "",
                    preference: "",
                    minPrice: "",
                    maxPrice: "",
                  });
                  fetchRooms();
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Rooms Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <Link
                to={`/rooms/${room._id}`}
                key={room._id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 hover:border-indigo-100"
              >
                {/* Image Gallery */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getImageUrl(room, imageIndices[room._id] || 0)}
                    alt={room.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Image Navigation */}
                  {room.images?.length > 1 && (
                    <>
                      <button
                        onClick={(e) => handlePrevImage(e, room._id, room.images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Previous image"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleNextImage(e, room._id, room.images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Next image"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {room.images?.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {((imageIndices[room._id] || 0) + 1)} / {room.images.length}
                    </div>
                  )}
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                    ₹{room.price}/month
                  </div>
                </div>

                {/* Room Details */}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {room.title}
                    </h3>
                  </div>
                  
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{room.location}</span>
                  </div>
                  
                  {room.owner?.email && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">Listed by {room.owner.email.split('@')[0]}</span>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="h-4 w-4 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {room.preference === 'student' ? 'Student Housing' : 'Professional Housing'}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllRooms;