import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../context/AuthContext";

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [hasRoom, setHasRoom] = useState(false);

  // Update isOwner and hasRoom when room or user changes
  useEffect(() => {
    console.log('User:', user);
    console.log('Room:', room);
    if (user && room) {
      console.log('User ID:', user.id);
      console.log('Room Owner ID:', room.owner?._id);
      const ownerMatch = user.id === room.owner?._id;
      console.log('Is Owner:', ownerMatch);
      setIsOwner(ownerMatch);
      setHasRoom(!!user.roomId);
    } else {
      console.log('User or room not available');
      setIsOwner(false);
      setHasRoom(false);
    }
  }, [user, room]);

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/rooms/${id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setRoom(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  // Convert location to coordinates using OpenCage Geocoding
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!room || !room.location) return;

      try {
        const res = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            room.location
          )}&key=${process.env.REACT_APP_OPENCAGE_API_KEY}`
        );
        const data = await res.json();
        const result = data.results[0];

        if (result) {
          setCoordinates({
            lat: result.geometry.lat,
            lng: result.geometry.lng,
          });
        } else {
          console.warn("No coordinates found for this location.");
        }
      } catch (err) {
        console.error("Failed to fetch coordinates:", err);
      }
    };
    fetchCoordinates();
  }, [room]);

  // Fetch user's current location using Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleMessageOwner = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            receiverId: room.owner._id,
            content: `Hi, I'm interested in your room: "${room.title}".`,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      navigate(`/message/${room.owner._id}`);
    } catch (err) {
      alert("Failed to send message: " + err.message);
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === room.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? room.images.length - 1 : prev - 1
    );
  };

  // Function to calculate the route from user to room location using LocationIQ
  const calculateRoute = async () => {
    if (!userLocation || !coordinates) {
      alert("Your location or the room's location is not available.");
      return;
    }

    setIsCalculatingRoute(true);
    setDirectionsResponse(null); // Clear previous directions

    // LocationIQ Directions API URL
    const locationiqApiUrl = `https://us1.locationiq.com/v1/directions/driving/${userLocation.lng},${userLocation.lat};${coordinates.lng},${coordinates.lat}?key=${process.env.REACT_APP_LOCATIONIQ_API_KEY}&overview=full`;

    try {
      const res = await fetch(locationiqApiUrl);
      const data = await res.json();

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const polyline = data.routes[0].geometry.coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]);
        setDirectionsResponse(polyline);
      } else {
        console.error("LocationIQ API Error:", data.message);
        alert(`Could not find a route: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to fetch directions:", err);
      alert("Failed to get directions. Please try again.");
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/rooms/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error('Failed to delete room');
        
        navigate('/my-rooms');
      } catch (err) {
        alert('Error deleting room: ' + err.message);
      }
    }
  };

  // Basic Map Component
  const LocationMap = ({ coordinates }) => {
    if (!coordinates) return null;
    
    return (
      <div className="h-96 w-full">
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[coordinates.lat, coordinates.lng]}>
            <Popup>
              <div className="font-medium">Property Location</div>
              <div className="text-sm text-gray-600">
                {coordinates.address || 'No address available'}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20 flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 mt-4">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 mt-4 flex-grow">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading room details
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center flex-grow">
          <p className="text-gray-500">No room details found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <h3 className="text-3xl font-bold text-gray-900 text-center mb-8 px-4 py-3 bg-white rounded-lg shadow-sm">
          About this property
        </h3>
      </div>
      <main className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8 flex-grow">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Image Gallery */}
          <div className="relative">
            {room.images && room.images.length > 0 ? (
              <div className="relative h-96 w-full">
                <img
                  src={room.images[currentImageIndex].url}
                  alt={`${room.title} - ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {room.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {room.images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="h-96 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No images available</span>
              </div>
            )}
          </div>

          {/* Room Details */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {room.title}
                </h1>
                <div className="mt-1 flex items-center text-gray-600">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-1.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {room.location}
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-600">
                ₹{room.price}
                <span className="text-sm font-normal text-gray-500">
                  /month
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900">
                About this property
              </h2>
              {room.description && (
                <p className="mt-2 text-gray-600">{room.description}</p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1a1 1 0 000 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Type: {room.preferences.join(", ")}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Owner: {room.owner?.email || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              {isOwner ? (
                // Show Edit and Delete buttons for room owner
                <>
                  <button
                    onClick={() => navigate(`/rooms/${room._id}/edit`)}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium"
                  >
                    Edit Room
                  </button>
                  <button
                    onClick={handleDeleteRoom}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-medium"
                  >
                    Delete Room
                  </button>
                </>
              ) : (
                // Show Book and Message buttons for other users
                <>
                  <button
                    onClick={() => navigate(`/rooms/${room._id}/book`)}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={handleMessageOwner}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium"
                  >
                    <div className="flex items-center justify-center">
                      <svg
                        className="h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Message Owner
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Map Section */}
        {coordinates && (
          <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Location</h2>
              <LocationMap coordinates={coordinates} />
            </div>
          </div>
        )}
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default RoomDetails;