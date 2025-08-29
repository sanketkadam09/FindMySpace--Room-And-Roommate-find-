// models/Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  price: Number,
  preferences: [String], // like ['student', 'working']
 images: [
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  }
], // for now, string URLs
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default:[],
    }
  }
}, { timestamps: true });
roomSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Room", roomSchema);
