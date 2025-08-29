// client/src/components/MyPage/index.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiClock, FiHome, FiDollarSign, FiInfo } from "react-icons/fi";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { AuthContext } from "../../context/AuthContext";
import RoomPhotoGallery from "../RoomPhotoGallery";

const MyPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState(null);
    const [userCapabilities, setUserCapabilities] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        console.log("MyPage Load: isAuthenticated =", isAuthenticated);
        console.log("MyPage Load: loading =", loading);
        console.log("MyPage Load: user =", user);

        if (!loading && !isAuthenticated) {
            console.warn("MyPage: Not authenticated, redirecting to login...");
            navigate("/login");
        } else if (isAuthenticated && user) {
            loadUserProfile();
            loadUserCapabilities();
        }
    }, [loading, isAuthenticated, user, navigate]);

    const loadUserProfile = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/profile`, {
                credentials: "include"
            });
            
            if (res.ok) {
                const data = await res.json();
                setUserProfile(data.user);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setProfileLoading(false);
        }
    };

    const loadUserCapabilities = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/capabilities`, {
                credentials: "include"
            });
            
            if (res.ok) {
                const data = await res.json();
                setUserCapabilities(data.capabilities);
            }
        } catch (error) {
            console.error("Error loading capabilities:", error);
        }
    };

    const handleEditProfile = () => {
        navigate("/profile");
    };

    const handleDeleteRoomPhoto = async (photoUrl) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/room-photos/${encodeURIComponent(photoUrl)}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                // Reload profile to get updated photos
                loadUserProfile();
            } else {
                console.error("Failed to delete photo");
            }
        } catch (error) {
            console.error("Error deleting photo:", error);
        }
    };

    const getRoleDisplayName = (role, subRole) => {
        switch (role) {
            case 'owner':
                return 'Room Owner';
            case 'seeker':
                return 'Room Seeker';
            case 'roommate':
                return subRole === 'hasRoom' ? 'Roommate Seeker (Has Room)' : 'Roommate Seeker (Needs Room)';
            default:
                return role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'N/A';
        }
    };

    if (loading || profileLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <FiUser className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h2>
                    <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const profileData = userProfile || user;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                    <div className="px-6 py-8 sm:px-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="relative">
                                {profileData.profileImage ? (
                                    <img
                                        src={`${process.env.REACT_APP_API_URL}${profileData.profileImage}`}
                                        alt="Profile"
                                        className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-md"
                                    />
                                ) : (
                                    <div className="h-28 w-28 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <FiUser className="h-14 w-14 text-indigo-600" />
                                    </div>
                                )}
                                <button
                                    onClick={handleEditProfile}
                                    className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                                    aria-label="Edit profile"
                                >
                                    <FiEdit2 className="h-5 w-5 text-indigo-600" />
                                </button>
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                            {profileData.name}
                                        </h1>
                                        <div className="flex items-center mt-1 text-gray-600">
                                            <FiMail className="mr-2 h-4 w-4" />
                                            <span>{profileData.email}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                            {getRoleDisplayName(profileData.role, profileData.subRole)}
                                        </span>
                                        {profileData.profileComplete && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                Profile Complete
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {profileData.bio && (
                                    <p className="mt-3 text-gray-600">
                                        {profileData.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FiUser className="mr-2 text-indigo-600" />
                                    Basic Information
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start">
                                    <div className="w-1/3 text-gray-500">Gender</div>
                                    <div className="flex-1 font-medium text-gray-900">
                                        {profileData.gender || 'Not specified'}
                                    </div>
                                </div>
                                
                                {profileData.contactInfo?.phone && (
                                    <div className="flex items-start">
                                        <div className="w-1/3 text-gray-500 flex items-center">
                                            <FiPhone className="mr-2 h-4 w-4" /> Phone
                                        </div>
                                        <div className="flex-1 font-medium text-gray-900">
                                            {String(profileData.contactInfo.phone).replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-start">
                                    <div className="w-1/3 text-gray-500">Preferred Contact</div>
                                    <div className="flex-1 font-medium text-gray-900 capitalize">
                                        {profileData.contactInfo?.preferredContact || 'email'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Living Preferences Card */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FiHome className="mr-2 text-indigo-600" />
                                    Living Preferences
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {profileData.preferences?.city && (
                                    <div className="flex items-start">
                                        <div className="w-1/3 text-gray-500 flex items-center">
                                            <FiMapPin className="mr-2 h-4 w-4" /> City
                                        </div>
                                        <div className="flex-1 font-medium text-gray-900">
                                            {profileData.preferences.city}
                                        </div>
                                    </div>
                                )}
                                
                                {profileData.preferences?.age && (
                                    <div className="flex items-start">
                                        <div className="w-1/3 text-gray-500">Age</div>
                                        <div className="flex-1 font-medium text-gray-900">
                                            {profileData.preferences.age}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="flex items-start">
                                        <div className="w-1/2 text-gray-500">Sleep Schedule</div>
                                        <div className="flex-1 font-medium text-gray-900 capitalize">
                                            {profileData.preferences?.sleepSchedule || 'Not specified'}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="w-1/2 text-gray-500">Food Habit</div>
                                        <div className="flex-1 font-medium text-gray-900 capitalize">
                                            {profileData.preferences?.foodHabit || 'Not specified'}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="w-1/2 text-gray-500">Noise Level</div>
                                        <div className="flex-1 font-medium text-gray-900 capitalize">
                                            {profileData.preferences?.noiseTolerance || 'Not specified'}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="w-1/2 text-gray-500">Cleanliness</div>
                                        <div className="flex-1 font-medium text-gray-900 capitalize">
                                            {profileData.preferences?.cleanlinessLevel || 'Not specified'}
                                        </div>
                                    </div>
                                    
                                    {(profileData.preferences?.minBudget || profileData.preferences?.maxBudget) && (
                                        <div className="flex items-start">
                                            <div className="w-1/2 text-gray-500">Budget Range</div>
                                            <div className="flex-1 font-medium text-gray-900">
                                                {profileData.preferences?.minBudget && profileData.preferences?.maxBudget 
                                                    ? `₹${profileData.preferences.minBudget.toLocaleString()} - ₹${profileData.preferences.maxBudget.toLocaleString()}/month`
                                                    : profileData.preferences?.minBudget 
                                                        ? `Min ₹${profileData.preferences.minBudget.toLocaleString()}/month`
                                                        : `Max ₹${profileData.preferences?.maxBudget.toLocaleString()}/month`
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Additional Preferences */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Additional Preferences
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Pets Allowed</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            profileData.preferences?.petsAllowed 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {profileData.preferences?.petsAllowed ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Smoking Allowed</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            profileData.preferences?.smoking 
                                                ? 'bg-red-100 text-red-800' 
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {profileData.preferences?.smoking ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    
                                    {profileData.preferences?.budgetRange && (
                                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                                            <span className="text-gray-500">Budget Range</span>
                                            <span className="font-medium text-gray-900">
                                                {profileData.preferences.budgetRange}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {profileData.preferences?.location && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Preferred Location</span>
                                            <span className="font-medium text-gray-900">
                                                {profileData.preferences.location}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Account Status
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Member Since</span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(profileData.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <div className="pt-4 mt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleEditProfile}
                                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MyPage;