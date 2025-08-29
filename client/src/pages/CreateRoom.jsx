// src/pages/CreateRoom.jsx
import React, { useState, useEffect } from "react"; // ⬅️ import useEffect
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CreateRoom = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    preferences: "",
    lat: "",
    lng: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // ➡️ NEW: useEffect with a debounce delay for geocoding
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (form.location.trim() !== "") {
        geocodeLocation(form.location);
      }
    }, 800); // Wait 800ms after the user stops typing

    return () => clearTimeout(delayDebounce); // Clear the timeout if the component unmounts or location changes again
  }, [form.location]);

  const geocodeLocation = async (location) => {
    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/search?key=${process.env.REACT_APP_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
          location
        )}&format=json`
      );
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0];
        setForm((prev) => ({
          ...prev,
          lat: lat.toString(),
          lng: lon.toString(),
        }));
      } else {
        console.warn("Geocoding failed or returned no results:", data);
        setForm((prev) => ({ ...prev, lat: "", lng: "" }));
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setForm((prev) => ({ ...prev, lat: "", lng: "" }));
    }
  };

  // ➡️ REVISED: Simplified handleChange function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Please enter a valid location to fetch coordinates.");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("location", form.location);
    formData.append("price", form.price);
    formData.append("preferences", form.preferences);
    formData.append("lat", lat);
    formData.append("lng", lng);

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/rooms`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create room");

      setSuccess("✅ Room posted successfully!");
      setTimeout(() => navigate("/my-rooms"), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto p-6 mt-6 bg-white rounded shadow">
        <br></br><br></br>
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">
          🛏️ Post a New Room
        </h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            className="w-full border p-2 rounded"
            rows={4}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />

          {form.lat && form.lng && (
            <p className="text-sm text-gray-600">
              📍 Coordinates: {form.lat}, {form.lng}
            </p>
          )}

          <input
            type="number"
            name="price"
            placeholder="Price"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />

          <select
            name="preferences"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          >
            <option value="">Select Preference</option>
            <option value="student">Student</option>
            <option value="working">Working</option>
          </select>

          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            className="w-full border p-2 rounded"
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="h-24 w-24 object-cover rounded"
              />
            ))}
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Submit Room
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CreateRoom;