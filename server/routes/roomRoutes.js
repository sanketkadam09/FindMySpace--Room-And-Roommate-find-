// routes/roomRoutes.js
const express = require("express");
const router = express.Router();
const {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    matchRoomsByPreference,
    getMyRooms,
} = require("../controllers/roomController");

const { jsonwebtoken } = require("../middleware/JwtAuth");
const { checkRole } = require("../middleware/CheckRole");
const { images } = require("../middleware/Upload");

// POST /api/rooms - Create a room (for room owners and roommates with rooms)
router.post(
    "/",
    jsonwebtoken,
    checkRole(['owner', 'roommate']), 
    images,
    createRoom
);

router.get("/", jsonwebtoken, getAllRooms);


router.get(
    "/my-rooms",
    jsonwebtoken,
    checkRole(['owner', 'roommate']),
    getMyRooms
);


router.put(
    "/:id",
    jsonwebtoken,
    checkRole(['owner', 'roommate']), 
    images,
    updateRoom
);


router.delete(
    "/:id",
    jsonwebtoken,
    checkRole(['owner', 'roommate']), 
    deleteRoom
);

// GET /api/rooms/match/percent 
router.get(
    "/match/percent",
    jsonwebtoken,
    checkRole(['seeker', 'roommate']),
    matchRoomsByPreference
);


router.get("/:id", jsonwebtoken, getRoomById);

module.exports = router;