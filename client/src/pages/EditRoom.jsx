// src/pages/EditRoom.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const EditRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    preferences: "",
    lat: "",
    lng: "",
  });

  // State to hold existing images from the backend
  const [existingImages, setExistingImages] = useState([]);
  // State to hold new files to be uploaded
  const [newFiles, setNewFiles] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔄 Fetch existing room
  useEffect(() => {
    const fetchRoom = async () => {
      // ... (existing fetch logic remains the same)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/rooms/${id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error("❌ Unauthorized access. Please login.");
          }
          throw new Error(data.message || "Failed to load room");
        }

        setForm({
          ...data,
          lat: data.lat?.toString() || "",
          lng: data.lng?.toString() || "",
        });
        setExistingImages(data.images || []); // Set existing images
      } catch (err) {
        setError(err.message);
        if (err.message.includes("Unauthorized")) {
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    };

    fetchRoom();
  }, [id, navigate]);

  // 📍 Trigger geocoding when location changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (form.location.trim() !== "") {
        geocodeLocation(form.location);
      }
    }, 800); // debounce to avoid spamming API

    return () => clearTimeout(delayDebounce);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for new file selection
  const handleFileChange = (e) => {
    setNewFiles(Array.from(e.target.files));
  };
  
  // Handler for removing an existing image
  const handleRemoveImage = (indexToRemove) => {
    setExistingImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);

    if (isNaN(lat) || isNaN(lng)) {
      setError("📍 Coordinates are missing or invalid. Please enter a valid location.");
      return;
    }

    // Combine existing images and new files into a FormData object
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("location", form.location);
    formData.append("price", form.price);
    formData.append("preferences", form.preferences);
    formData.append("lat", lat);
    formData.append("lng", lng);

    // Append existing image URLs
    existingImages.forEach(imageObj => {
      formData.append("existingImages", imageObj.url);
    });

    // Append new files
    newFiles.forEach(file => {
      formData.append("images", file); // Must match backend field name
    });

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/rooms/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData, // Send FormData
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("❌ You are not authorized to update this room. Please login.");
        }
        throw new Error(data.message || "Failed to update room");
      }

      setSuccess("✅ Room updated successfully!");
      setTimeout(() => navigate("/my-rooms"), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <br></br>
      <br></br>
      <main className="flex-grow max-w-3xl mx-auto p-6 mt-6 bg-white rounded shadow">
       
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">🛠️ Edit Room</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4" >
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Title"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Description"
            rows={4}
            required
          />
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Location"
            required
          />
          {form.lat && form.lng ? (
            <p className="text-sm text-gray-600">
              📍 Coordinates: {form.lat}, {form.lng}
            </p>
          ) : (
            <p className="text-sm text-red-500">⚠️ Coordinates not found</p>
          )}
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Price"
            required
          />
          <select
            name="preferences"
            value={Array.isArray(form.preferences) ? form.preferences[0] || '' : form.preferences}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Preference</option>
            <option value="student">Student</option>
            <option value="working">Working</option>
          </select>
          
          {/* Section for existing images */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Existing Images</label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((image, index) => (
                <div key={image.public_id || index} className="relative group">
                  <img src={image.url} alt={`Room ${index}`} className="h-24 w-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Section for adding new images */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Add New Images</label>
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              className="w-full border p-2 rounded"
              onChange={handleFileChange}
            />
            <div className="flex flex-wrap gap-2">
              {newFiles.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`New Preview ${index}`}
                  className="h-24 w-24 object-cover rounded"
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Update Room
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default EditRoom;