const Booking = require("../models/Booking");
const Room = require("../models/Room"); // 


exports.createBooking = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, guests, message } = req.body;
    const roomId = req.params.roomId;

    // Optional: validate dates
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    const booking = new Booking({
      room: roomId,
      user: req.payload.id,
      checkInDate,
      checkOutDate,
      guests,
      message,
    });

    await booking.save();
    res.status(201).json({ message: "Room booked", booking });
  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.payload.id;
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "room",
        select: "title location price photos",
        // Ensure photos is always an array
        transform: (doc) => {
          if (doc) {
            doc.photos = doc.photos || [];
          }
          return doc;
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your bookings", error: err });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.payload.id) {
      return res.status(403).json({ message: "Unauthorized to cancel this booking" });
    }

    await booking.deleteOne();
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling booking", error: err.message });
  }
};


// controllers/bookingController.js
exports.getReceivedBookings = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.payload.id }); // owner = current user
    const roomIds = rooms.map(r => r._id);

    const bookings = await Booking.find({ room: { $in: roomIds } })
      .populate("user", "username email")
      .populate("room", "title");

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to get received bookings", error: err.message });
  }
};