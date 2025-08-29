const express = require("express");
const router = express.Router();
const { jsonwebtoken } = require("../middleware/JwtAuth");
const { checkRole } = require("../middleware/CheckRole"); // <<< THIS WAS THE MISSING PIECE IN THE EXPLANATION

const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getReceivedBookings,
} = require("../controllers/bookingController");


router.post("/:roomId", jsonwebtoken, createBooking);


router.get("/me", jsonwebtoken, getMyBookings);


router.delete("/:bookingId", jsonwebtoken, cancelBooking);


router.get(
  "/received",
  jsonwebtoken,
  checkRole(["owner", "roommate"]),
  getReceivedBookings
);

module.exports = router;