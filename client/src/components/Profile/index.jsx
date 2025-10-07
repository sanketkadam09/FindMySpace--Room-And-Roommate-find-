// client/src/components/Profile/index.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { AuthContext } from "../../context/AuthContext";
import { API_URL } from "../../config";

const ProfileSetup = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, logout, login: authLogin, updateUser } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        preferences: {
            city: "",
            age: "",
            sleepSchedule: "early",
            foodHabit: "vegetarian",
            noiseTolerance: "moderate",
            cleanlinessLevel: "average",
            budgetRange: "",
            location: "",
            petsAllowed: false,
            smoking: false,
            timePreference: 'flexible',
            minBudget: '',
            maxBudget: '',
        },
        contactInfo: {
            email: "",
            phone: "",
        },
        socialMedia: {
            facebook: "",
            twitter: "",
            linkedin: "",
        },
        userType: "roommate", // Default user type
        hasRoom: false, // For roommates
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formLoading, setFormLoading] = useState(true); // Initialize as true to show loading initially
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login");
            return;
        }

        // Only load profile and capabilities if user is authenticated and not already loading auth
        if (user && isAuthenticated && !loading) {
            const fetchData = async () => {
                setFormLoading(true); // Start component-specific loading
                try {
                    await loadUserProfile();
                } catch (err) {
                    console.error("Error fetching initial profile data:", err);
                    setError("Failed to load profile data.");
                } finally {
                    setFormLoading(false); // End component-specific loading
                }
            };
            fetchData();
        }
    }, [user, isAuthenticated, loading, navigate]); // Add navigate to dependencies if it's used inside useEffect directly

    const loadUserProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/api/profile`, {
                credentials: "include"
            });
            
            if (res.ok) {
                const data = await res.json();
                const userData = data.user;
                
                setFormData(prev => ({
                    ...prev,
                    name: userData.name || "",
                    gender: userData.gender || "",
                    preferences: { ...prev.preferences, ...userData.preferences },
                    contactInfo: { ...prev.contactInfo, ...userData.contactInfo },
                    socialMedia: { ...prev.socialMedia, ...userData.socialMedia },
                    userType: userData.role || "roommate", // Correctly use role from backend
                    hasRoom: userData.hasRoom || false,
                }));

                if (userData.profileImage) {
                    setImagePreview(`${API_URL}${userData.profileImage}`);
                }
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to load profile data.");
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            throw error; // Re-throw to be caught by the fetchData wrapper
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === "checkbox" ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadProfileImage = async () => {
        if (!profileImage) return;

        const formData = new FormData();
        formData.append('profileImage', profileImage);

        try {
            const res = await fetch(`${API_URL}/api/users/upload-profile-image`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                setSuccess("Profile image uploaded successfully!");
                setProfileImage(null); // Clear the selected file after upload
            } else {
                const data = await res.json();
                setError(data.message || "Failed to upload profile image");
            }
        } catch (error) {
            setError("Error uploading profile image");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true); // Use formLoading for submission
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`${API_URL}/api/profile`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            setSuccess("Profile updated successfully!");
            
            // Update auth context with new user data
            if (data.user) {
                updateUser({ ...data.user, userType: data.user.role }); // Ensure context is updated with role
            }

            // Upload images if selected
            if (profileImage) {
                await uploadProfileImage();
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setFormLoading(false); // Reset formLoading after submission
        }
    };

    const handleUserTypeChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Modified loading condition:
    // Shows loading if AuthContext is loading OR if this component is loading its initial data
    if (loading || formLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 pt-20 pb-8 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
                    </div>
                    
                    <div className="p-6">
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
                        
                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700">{success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter your full name"
                                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            onChange={handleChange}
                                            value={formData.name}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                        <select
                                            name="gender"
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            value={formData.gender}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="nonbinary">Non-binary</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Image */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">Profile Image</h2>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                    <div className="flex-shrink-0">
                                        {imagePreview ? (
                                            <img 
                                                src={imagePreview} 
                                                alt="Profile preview" 
                                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload a photo</label>
                                        <div className="flex items-center space-x-4">
                                            <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                Choose File
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleProfileImageChange}
                                                    className="sr-only"
                                                />
                                            </label>
                                            <span className="text-sm text-gray-500 truncate">
                                                {profileImage ? profileImage.name : 'No file chosen'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">JPG, GIF or PNG. Max size 2MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* User Type & Preferences - Hidden for owners */}
                            {formData.userType !== 'owner' && (
                                <>
                                    {/* User Type - Conditionally render this section */}
                                    {!(formData.userType === 'roommate' && !formData.hasRoom) && (
                                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">Account Type</h2>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                                                    <select
                                                        name="userType"
                                                        value={formData.userType}
                                                        onChange={handleUserTypeChange}
                                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    >
                                                        <option value="roommate">Roommate</option>
                                                        <option value="owner">Room Owner</option>
                                                    </select>
                                                </div>

                                                {formData.userType === 'roommate' && (
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="hasRoom"
                                                            name="hasRoom"
                                                            checked={formData.hasRoom}
                                                            onChange={handleUserTypeChange}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor="hasRoom" className="ml-2 block text-sm text-gray-700">
                                                            I also have a room to list
                                                        </label>
                                                    </div>
                                                )}

                                                {(formData.userType === 'owner' || (formData.userType === 'roommate' && formData.hasRoom)) && (
                                                    <div className="pt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate('/create-room')}
                                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        >
                                                            Post Your Room
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Preferences */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">Preferences</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred City</label>
                                                <input
                                                    type="text"
                                                    name="preferences.city"
                                                    placeholder="Enter city"
                                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    onChange={handleChange}
                                                    value={formData.preferences.city}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                                <input
                                                    type="number"
                                                    name="preferences.age"
                                                    placeholder="Enter age"
                                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    onChange={handleChange}
                                                    value={formData.preferences.age}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Schedule</label>
                                                <select
                                                    name="preferences.sleepSchedule"
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    value={formData.preferences.sleepSchedule}
                                                >
                                                    <option value="early">Early Bird</option>
                                                    <option value="late">Night Owl</option>
                                                    <option value="flexible">Flexible</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Food Habit</label>
                                                <select
                                                    name="preferences.foodHabit"
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    value={formData.preferences.foodHabit}
                                                >
                                                    <option value="vegetarian">Vegetarian</option>
                                                    <option value="non-vegetarian">Non-vegetarian</option>
                                                    <option value="vegan">Vegan</option>
                                                    <option value="flexible">Flexible</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Noise Tolerance</label>
                                                <select
                                                    name="preferences.noiseTolerance"
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    value={formData.preferences.noiseTolerance}
                                                >
                                                    <option value="low">Low (Quiet environment)</option>
                                                    <option value="moderate">Moderate</option>
                                                    <option value="high">High (Noise is okay)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness Level</label>
                                                <select
                                                    name="preferences.cleanlinessLevel"
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    value={formData.preferences.cleanlinessLevel}
                                                >
                                                    <option value="very-clean">Very Clean</option>
                                                    <option value="clean">Clean</option>
                                                    <option value="average">Average</option>
                                                    <option value="relaxed">Relaxed</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range (per month)</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="flex rounded-md shadow-sm">
                                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                                Min
                                                            </span>
                                                            <input
                                                                type="number"
                                                                name="preferences.minBudget"
                                                                placeholder="Min amount"
                                                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                onChange={handleChange}
                                                                value={formData.preferences.minBudget || ''}
                                                            />
                                                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                                ₹
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex rounded-md shadow-sm">
                                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                                Max
                                                            </span>
                                                            <input
                                                                type="number"
                                                                name="preferences.maxBudget"
                                                                placeholder="Max amount"
                                                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                                onChange={handleChange}
                                                                value={formData.preferences.maxBudget || ''}
                                                            />
                                                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                                ₹
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">Leave blank if not applicable</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Preference</label>
                                                <select
                                                    name="preferences.timePreference"
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    value={formData.preferences.timePreference || 'flexible'}
                                                >
                                                    <option value="morning">Morning Person</option>
                                                    <option value="afternoon">Afternoon Person</option>
                                                    <option value="evening">Evening Person</option>
                                                    <option value="flexible">Flexible</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="petsAllowed"
                                                    name="preferences.petsAllowed"
                                                    checked={formData.preferences.petsAllowed || false}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="petsAllowed" className="ml-2 block text-sm text-gray-700">
                                                    Pets Allowed
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="smoking"
                                                    name="preferences.smoking"
                                                    checked={formData.preferences.smoking || false}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="smoking" className="ml-2 block text-sm text-gray-700">
                                                    Smoking Allowed
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Contact Information */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="contactInfo.email"
                                            placeholder="Enter email"
                                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            onChange={handleChange}
                                            value={formData.contactInfo.email}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            name="contactInfo.phone"
                                            placeholder="Enter 10-digit phone number"
                                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Only allow numbers and up to 10 digits
                                                if (value === '' || /^\d{0,10}$/.test(value)) {
                                                    handleChange({
                                                        target: {
                                                            name: 'contactInfo.phone',
                                                            value: value === '' ? '' : parseInt(value, 10)
                                                        }
                                                    });
                                                }
                                            }}
                                            value={formData.contactInfo.phone || ''}
                                            pattern="[0-9]{10}"
                                            title="Please enter a 10-digit phone number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100">Social Media</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                https://facebook.com/
                                            </span>
                                            <input
                                                type="text"
                                                name="socialMedia.facebook"
                                                placeholder="username"
                                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                onChange={handleChange}
                                                value={formData.socialMedia.facebook}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                https://twitter.com/
                                            </span>
                                            <input
                                                type="text"
                                                name="socialMedia.twitter"
                                                placeholder="username"
                                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                onChange={handleChange}
                                                value={formData.socialMedia.twitter}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                https://linkedin.com/in/
                                            </span>
                                            <input
                                                type="text"
                                                name="socialMedia.linkedin"
                                                placeholder="username"
                                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                onChange={handleChange}
                                                value={formData.socialMedia.linkedin}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formLoading ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default ProfileSetup;