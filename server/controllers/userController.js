// controllers/userController.js
const User = require("../models/User");
const { deleteFileFromCloudinary } = require("../middleware/Upload"); // Only need the delete function

// ✅ UPDATED: Upload profile image
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const user = await User.findById(req.payload.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete old profile image from Cloudinary if it exists
        if (user.profileImage && user.profileImage.public_id) {
            await deleteFileFromCloudinary(user.profileImage.public_id);
        }

        // Save new profile image info
        user.profileImage = {
            url: req.file.path,
            public_id: req.file.filename
        };
        await user.save();

        res.status(200).json({
            message: "Profile image uploaded successfully",
            profileImage: user.profileImage.url
        });
    } catch (error) {
        console.error("Upload profile image error:", error);
        res.status(500).json({ message: "Error uploading profile image", error: error.message });
    }
};

exports.uploadRoomPhotos = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No image files provided" });
        }

        const user = await User.findById(req.payload.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user can upload room photos
        if (!user.canUploadRoomPhotos) {
            return res.status(403).json({
                message: "You are not authorized to upload room photos"
            });
        }
        
        // Map uploaded files to an array of objects
        const newPhotos = req.files.map(file => ({
            url: file.path,
            public_id: file.filename
        }));

        // Add new photos to existing ones
        user.roomDetails.roomPhotos = [...(user.roomDetails.roomPhotos || []), ...newPhotos];
        await user.save();

        res.status(200).json({
            message: "Room photos uploaded successfully",
            roomPhotos: user.roomDetails.roomPhotos
        });
    } catch (error) {
        console.error("Upload room photos error:", error);
        res.status(500).json({ message: "Error uploading room photos", error: error.message });
    }
};

// ✅ UPDATED: Delete room photo
exports.deleteRoomPhoto = async (req, res) => {
    try {
        const { public_id } = req.body; // ⬅️ Get public_id from request body
        
        const user = await User.findById(req.payload.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (!user.canUploadRoomPhotos) {
            return res.status(403).json({
                message: "You are not authorized to manage room photos"
            });
        }

        const photoIndex = user.roomDetails.roomPhotos.findIndex(photo => photo.public_id === public_id);
        if (photoIndex === -1) {
            return res.status(404).json({ message: "Photo not found" });
        }

        // Delete file from Cloudinary
        await deleteFileFromCloudinary(public_id);
        
        // Remove from array
        user.roomDetails.roomPhotos.splice(photoIndex, 1);
        await user.save();

        res.status(200).json({
            message: "Room photo deleted successfully",
            roomPhotos: user.roomDetails.roomPhotos
        });
    } catch (error) {
        console.error("Delete room photo error:", error);
        res.status(500).json({ message: "Error deleting room photo", error: error.message });
    }
};


exports.getRoomDetails = async (req, res) => {
    try {
        const user = await User.findById(req.payload.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.needsRoomDetails) {
            return res.status(403).json({ 
                message: "You don't have room details to display" 
            });
        }

        res.status(200).json({ 
            roomDetails: user.roomDetails,
            canUploadPhotos: user.canUploadRoomPhotos
        });
    } catch (error) {
        console.error("Get room details error:", error);
        res.status(500).json({ message: "Error fetching room details", error: error.message });
    }
};


exports.updateRoomDetails = async (req, res) => {
    try {
        const { location, budget, description, amenities, availableFrom, availableTo } = req.body;

        const user = await User.findById(req.payload.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.needsRoomDetails) {
            return res.status(403).json({ 
                message: "You are not authorized to update room details" 
            });
        }

        // Update room details
        if (location) user.roomDetails.location = location;
        if (budget) user.roomDetails.budget = budget;
        if (description) user.roomDetails.description = description;
        if (amenities) user.roomDetails.amenities = amenities;
        if (availableFrom) user.roomDetails.availableFrom = availableFrom;
        if (availableTo) user.roomDetails.availableTo = availableTo;

        await user.save();

        res.status(200).json({ 
            message: "Room details updated successfully",
            roomDetails: user.roomDetails
        });
    } catch (error) {
        console.error("Update room details error:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Validation failed", 
                errors 
            });
        }
        
        res.status(500).json({ message: "Error updating room details", error: error.message });
    }
};

// ✨ NEW: Get users by role for matching
exports.getUsersByRole = async (req, res) => {
    try {
        const { role, subRole } = req.query;
        const currentUser = await User.findById(req.payload.id);
        
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        let query = { isActive: true, profileComplete: true };
        
        // Filter by role
        if (role) {
            query.role = role;
        }
        
        // Filter by subRole for roommate seekers
        if (subRole) {
            query.subRole = subRole;
        }
        
        // Exclude current user
        query._id = { $ne: currentUser._id };

        const users = await User.find(query)
            .select('name gender preferences roomDetails roommatePreferences profileImage role subRole')
            .limit(50);

        res.status(200).json({ users });
    } catch (error) {
        console.error("Get users by role error:", error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// ✨ NEW: Get user's permissions and capabilities
exports.getUserCapabilities = async (req, res) => {
    try {
        const user = await User.findById(req.payload.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const capabilities = {
            canUploadRoomPhotos: user.canUploadRoomPhotos,
            needsRoomDetails: user.needsRoomDetails,
            canCreateRooms: user.role === 'owner',
            canBookRooms: user.role === 'seeker',
            canMatchWithRoommates: user.role === 'roommate',
            canMatchWithOwners: user.role === 'seeker' || user.role === 'roommate',
            profileComplete: user.profileComplete,
            role: user.role,
            subRole: user.subRole
        };

        res.status(200).json({ capabilities });
    } catch (error) {
        console.error("Get user capabilities error:", error);
        res.status(500).json({ message: "Error fetching user capabilities", error: error.message });
    }
};

// ✨ NEW: Get current user info
exports.getCurrentUser = async (req, res) => {
  try {
        const user = await User.findById(req.payload.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

    res.status(200).json({ info: user });
  } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ message: "Error fetching user info", error: error.message });
  }
};

// ✨ NEW: Get user by ID
exports.getUserById = async (req, res) => {
  try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ info: user });
  } catch (error) {
        console.error("Get user by ID error:", error);
        res.status(500).json({ message: "Error fetching user info", error: error.message });
    }
};

// ✨ NEW: Deactivate user account
exports.deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.payload.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({ message: "Account deactivated successfully" });
    } catch (error) {
        console.error("Deactivate account error:", error);
        res.status(500).json({ message: "Error deactivating account", error: error.message });
    }
};