const express = require("express");
const router = express.Router();
const {
    getCompatibleUsers,
    getCompatibilityAnalysis,
    getPotentialRoommates,
    getAvailableRooms
} = require("../controllers/matchController");
const { jsonwebtoken } = require("../middleware/JwtAuth");

// ✨ NEW: Get compatible users for current user
router.get("/compatible-users", jsonwebtoken, getCompatibleUsers);

// ✨ NEW: Get detailed compatibility analysis with a specific user
router.get("/compatibility/:targetUserId", jsonwebtoken, getCompatibilityAnalysis);

// ✨ NEW: Get potential roommates (for roommate seekers)
router.get("/potential-roommates", jsonwebtoken, getPotentialRoommates);

// ✨ NEW: Get available rooms (for room seekers)
router.get("/available-rooms", jsonwebtoken, getAvailableRooms);

module.exports = router;
