import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MatchProfileCard from "../MatchProfile";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { AuthContext } from "../../context/AuthContext";
import { API_URL } from "../../config";



const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading } = useContext(AuthContext);

    const [matches, setMatches] = useState([]);
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [error, setError] = useState("");
    const [matchesLoading, setMatchesLoading] = useState(true);

    const [imageIndices, setImageIndices] = useState({});

    const [filters, setFilters] = useState({
        location: "",
    });

    const fetchMatches = useCallback(async () => {
        if (!user || user.role === 'owner' || (user.role === 'roommate' && user.subRole === 'hasRoom')) return;

        try {
            setMatchesLoading(true);
            const res = await fetch(`${API_URL}/api/rooms/match/percent`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setMatches(data);
            setFilteredMatches(data);
            const initialIndices = {};
            data.forEach(match => {
                if (match.room) {
                    initialIndices[match.room._id] = 0;
                }
            });
            setImageIndices(prev => ({ ...prev, ...initialIndices }));
        } catch (err) {
            setError(err.message);
        } finally {
            setMatchesLoading(false);
        }
    }, [user]);

    const fetchOwnerRoomsOrBookings = useCallback(async () => {
        if (!user || (user.role !== 'owner' && !(user.role === 'roommate' && user.subRole === 'hasRoom'))) return;

        try {
            setMatchesLoading(true);
            const roomsRes = await fetch(`${API_URL}/api/rooms/my-rooms`, {
                method: "GET",
                credentials: "include",
            });
            const roomsData = await roomsRes.json();
            if (!roomsRes.ok) throw new Error(roomsData.message);
            setMatches(roomsData);

            // Initialize imageIndices for all rooms
            const initialIndices = {};
            roomsData.forEach(room => {
                initialIndices[room._id] = 0;
            });
            setImageIndices(initialIndices);
        } catch (err) {
            setError(err.message);
        } finally {
            setMatchesLoading(false);
        }
    }, [user]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;
        try {
            const res = await fetch(`${API_URL}/api/rooms/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setMatches((prev) => prev.filter((r) => r._id !== id));
        } catch (err) {
            alert("❌ " + err.message);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login");
            return;
        }

        if (user) {
            if (user.role === 'owner' || (user.role === 'roommate' && user.subRole === 'hasRoom')) {
                fetchOwnerRoomsOrBookings();
            } else {
                fetchMatches();
            }
        }
    }, [user, isAuthenticated, loading, navigate, fetchMatches, fetchOwnerRoomsOrBookings]);

    useEffect(() => {
        const filtered = matches.filter((match) => {
            const { location } = filters;
            const room = match.room;
            
            const locationMatch = !location || 
                (room?.location?.toLowerCase().includes(location.toLowerCase()));

            return locationMatch;
        });

        setFilteredMatches(filtered);
    }, [filters, matches]);

    const handleMessage = (matchId) => {
        navigate(`/message/${matchId}`);
    };

    const handleNextImage = (roomId, totalImages) => {
        setImageIndices((prev) => ({
            ...prev,
            [roomId]: (prev[roomId] + 1) % totalImages,
        }));
    };

    const handlePrevImage = (roomId, totalImages) => {
        setImageIndices((prev) => ({
            ...prev,
            [roomId]: (prev[roomId] - 1 + totalImages) % totalImages,
        }));
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 text-center">
                        <br></br><br></br>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome to Your Dashboard
                        </h1>
                        <p className="text-gray-600">Find your perfect roommate with Room</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : user ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="mb-4 sm:mb-0">
                                        <h2 className="text-xl font-semibold text-gray-800">Welcome back, {user.name}</h2>
                                        <p className="text-gray-500 text-sm">Manage your account and find your perfect match</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {(user.role === 'owner' || (user.role === 'roommate' && user.subRole === 'hasRoom')) && (
                                            <>
                                                <button
                                                    onClick={() => navigate("/rooms/new")}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                >
                                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Post New Room
                                                </button>
                                                <button
                                                    onClick={() => navigate("/my-rooms")}
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                >
                                                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V16a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-5.586l-.293.293a1 1 0 001.414-1.414l-7-7z" />
                                                    </svg>
                                                    My Rooms
                                                </button>
                                            </>
                                        )}

                                        {(user.role === 'seeker' || (user.role === 'roommate' && user.subRole === 'noRoom')) && (
                                            <>
                                                <button
                                                    onClick={() => navigate("/rooms")}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                >
                                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                                    </svg>
                                                    Browse Rooms
                                                </button>
                                                <button
                                                    onClick={() => navigate("/my-bookings")}
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                >
                                                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                    My Bookings
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">Please login to view dashboard.</p>
                    )}

                    {/* Search & Filters for seekers */}
                    {user && (user.role === 'seeker' || (user.role === 'roommate' && user.subRole === 'noRoom')) && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Search by Location</h3>
                            </div>
                            <div className="px-6 py-4">
                                <div className="max-w-md">
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="location"
                                            id="location"
                                            placeholder="Enter location"
                                            value={filters.location}
                                            onChange={handleFilterChange}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {user?.role === 'owner' || (user?.role === 'roommate' && user?.subRole === 'hasRoom') 
                                ? 'Your Posted Rooms' 
                                : 'Available Rooms'}
                        </h2>
                        
                        {matchesLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : filteredMatches.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-12 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {filters.location 
                                            ? 'Try adjusting your search filters.' 
                                            : 'No rooms available at the moment.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {filteredMatches.map((match) =>
                                    match.room && match.room.owner ? (
                                        <MatchProfileCard
                                            key={match.room._id}
                                            user={match.room.owner}
                                            room={match.room}
                                            matchPercent={match.matchPercent}
                                            imageIndex={imageIndices[match.room._id] || 0}
                                            onPrevImage={() => handlePrevImage(match.room._id, match.room.images.length)}
                                            onNextImage={() => handleNextImage(match.room._id, match.room.images.length)}
                                            onMessage={handleMessage}
                                        />
                                    ) : null
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;