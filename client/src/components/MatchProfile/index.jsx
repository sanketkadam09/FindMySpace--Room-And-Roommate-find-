// client/src/components/MatchProfileCard/index.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';
import { API_URL } from "../../config";

const MatchProfileCard = ({ user, room, matchPercent, imageIndex, onPrevImage, onNextImage }) => {
    const navigate = useNavigate();
    if (!user) return null;

    const {
        _id,
        name,
        email,
        age,
        gender,
        city,
        profileImage,
        preferences = {},
    } = user;

    const {
        isSmoker,
        roomSharing,
        genderPreference,
        location,
        budgetRange,
        cleanlinessLevel,
        noiseTolerance,
        petsAllowed,
        sleepSchedule,
        foodHabit,
    } = preferences;

    const handleMessage = (e) => {
        e.stopPropagation(); // Prevents the parent div's onClick from firing
        navigate(`/message/${_id}`);
    };

    const handleViewRoom = () => {
        if (room && room._id) {
            navigate(`/rooms/${room._id}`);
        }
    };

    const imageUrl = profileImage
        ? `${API_URL}${profileImage}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              name
          )}&background=4f46e5&color=fff`;

    const roomImageUrl =
        room && room.images && room.images.length > 0
            ? room.images[imageIndex || 0]?.url
            : "https://via.placeholder.com/400x200?text=No+Room+Image";

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
            <div
                className="p-4 flex-grow cursor-pointer"
                onClick={handleViewRoom}
            >
                {/* Profile Info */}
                <div className="flex gap-4 items-start mb-4">
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200"
                    />
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
                                <p className="text-sm text-gray-600">Age: {age || "N/A"}</p>
                                <p className="text-sm text-gray-600">Gender: {gender || "N/A"}</p>
                                <p className="text-sm text-gray-600">City: {city || location || "N/A"}</p>
                            </div>
                            {matchPercent !== undefined && (
                                <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                    {matchPercent}% Match
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">My Preferences:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>{isSmoker ? "Smoker" : "Non-Smoker"}</p>
                        <p>{roomSharing ? "Room Sharing Preferred" : "Private Room Preferred"}</p>
                        {cleanlinessLevel && <p>🧹 Cleanliness: {cleanlinessLevel}</p>}
                        {noiseTolerance && <p>🔊 Noise: {noiseTolerance}</p>}
                        {sleepSchedule && <p>🌙 Sleep: {sleepSchedule}</p>}
                        {foodHabit && <p>🍱 Food: {foodHabit}</p>}
                        <p>🐾 Pets: {petsAllowed ? "Allowed" : "Not Allowed"}</p>
                        <p>Budget: {budgetRange || "Not set"}</p>
                    </div>
                </div>

                {/* Room Preview */}
                {room && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-md font-semibold text-gray-700 mb-3">Room I'm Offering:</h3>
                        <div className="relative w-full h-40 mb-3">
                            <img
                                src={roomImageUrl}
                                alt={room.title || "Room Photo"}
                                className="w-full h-40 object-cover rounded-md"
                            />
                            {room.images && room.images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPrevImage();
                                        }}
                                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNextImage();
                                        }}
                                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full"
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">{room.title}</h4>
                        <p className="text-sm text-gray-600 flex items-center mb-1">
                            <FaMapMarkerAlt className="mr-1 text-red-500" /> {room.location}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                             ₹{room.price}
                        </p>
                        {room.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                {room.description}
                            </p>
                        )}
                        {room.preferences && room.preferences.length > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                                Roommate Prefs: {room.preferences.join(", ")}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
                <button
                    onClick={handleMessage}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                    Message {name}
                </button>
                <button
                    onClick={handleViewRoom}
                    disabled={!room || !room._id}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded transition ${
                        room && room._id
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                >
                    View Room
                </button>
            </div>
        </div>
    );
};

export default MatchProfileCard;