// client/src/components/Signup/index.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Signup = () => {
    const navigate = useNavigate();
    const { login: authLogin } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        gender: "",
        role: "",
        subRole: "",
        contactInfo: {
            phone: "",
            preferredContact: "email"
        }
    });

    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes(".")) {
            const [parent, child] = name.split(".");
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
                [name]: type === "checkbox" ? checked : value
            }));
        }

        if (error) setError("");
        if (validationErrors.length > 0) setValidationErrors([]);
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.name.trim()) errors.push("Name is required");
        if (!formData.email.trim()) errors.push("Email is required");
        if (!formData.password.trim()) errors.push("Password is required");
        if (!formData.gender) errors.push("Gender is required");
        if (!formData.role) errors.push("Role is required");

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setValidationErrors([]);

        const errors = validateForm();
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
          const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                gender: formData.gender,
                role: formData.role,
                subRole: formData.subRole,
                contactInfo: {
                    ...formData.contactInfo,
                    email: formData.email
                }
            };

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/signup`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                    setValidationErrors(data.errors);
                } else {
                    throw new Error(data.message || "Signup failed");
                }
                return;
            }

            if (data.user) {
                authLogin(data.user);
            }

            if (data.user.profileComplete) {
                navigate("/dashboard");
            } else {
                navigate("/profile");
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-pink-100"
          style={{
          backgroundImage: "url('/image/')",
        }}
        >
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
                    Create Account
                </h2>

                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

                {validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                        <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
                        <ul className="list-disc list-inside text-sm text-red-700">
                            {validationErrors.map((err, index) => (
                                <li key={index}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            className="w-full border border-gray-300 rounded px-4 py-2"
                            onChange={handleChange}
                            value={formData.name}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="w-full border border-gray-300 rounded px-4 py-2"
                            onChange={handleChange}
                            value={formData.email}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="w-full border border-gray-300 rounded px-4 py-2"
                            onChange={handleChange}
                            value={formData.password}
                        />
                        <select
                            name="gender"
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-4 py-2"
                            value={formData.gender}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="nonbinary">Non-binary</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-gray-700 font-medium">I am signing up as a:</label>
                        <div className="space-y-2">
                            {["owner", "seeker", "roommate"].map(roleOption => (
                                <div key={roleOption} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`role_${roleOption}`}
                                        name="role"
                                        value={roleOption}
                                        checked={formData.role === roleOption}
                                        onChange={handleChange}
                                        required
                                        className="mr-3"
                                    />
                                    <label htmlFor={`role_${roleOption}`} className="text-sm">
                                        <strong>{roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}</strong> - {
                                            roleOption === "owner"
                                                ? "I have a room and want to find a roommate"
                                                : roleOption === "seeker"
                                                    ? "I need a room to rent"
                                                    : "I want to find a roommate to live with"
                                        }
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {formData.role === "roommate" && (
                        <div className="space-y-3">
                            <label className="block text-gray-700 font-medium">Do you have a room?</label>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="hasRoom"
                                        name="subRole"
                                        value="hasRoom"
                                        checked={formData.subRole === "hasRoom"}
                                        onChange={handleChange}
                                        required={formData.role === "roommate"}
                                        className="mr-3"
                                    />
                                    <label htmlFor="hasRoom" className="text-sm">
                                        Yes, I have a room and want to share it
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="noRoom"
                                        name="subRole"
                                        value="noRoom"
                                        checked={formData.subRole === "noRoom"}
                                        onChange={handleChange}
                                        required={formData.role === "roommate"}
                                        className="mr-3"
                                    />
                                    <label htmlFor="noRoom" className="text-sm">
                                        No, I need to find someone to rent with
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-800">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="tel"
                                name="contactInfo.phone"
                                placeholder="Phone Number (10 digits, optional)"
                                className="w-full border border-gray-300 rounded px-4 py-2"
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
                                value={formData.contactInfo.phone}
                                pattern="[0-9]{10}"
                                title="Please enter a 10-digit phone number"
                            />
                            <select
                                name="contactInfo.preferredContact"
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-4 py-2"
                                value={formData.contactInfo.preferredContact}
                            >
                                <option value="email">Preferred Contact: Email</option>
                                <option value="phone">Preferred Contact: Phone</option>
                                <option value="both">Preferred Contact: Both</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                        Create Account
                    </button>
                </form>

                <p className="text-sm mt-6 text-center text-gray-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-indigo-600 font-semibold hover:underline">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Signup;
