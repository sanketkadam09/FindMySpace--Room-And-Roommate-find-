const mongoose = require("mongoose");

// Preferences Schema (nested)
const preferenceSchema = new mongoose.Schema({
  city: String,
  age: String,
  sleepSchedule: String,
  foodHabit: String,
  noiseTolerance: String,
  cleanlinessLevel: String,
  minBudget: { type: Number, min: 0 },
  maxBudget: { 
    type: Number, 
    min: 0,
    validate: {
      validator: function(v) {
        return !this.minBudget || v >= this.minBudget;
      },
      message: 'Maximum budget must be greater than or equal to minimum budget'
    }
  },
  location: String,
  petsAllowed: Boolean,
  smoking: Boolean,
  timePreference: { type: String, enum: ['morning', 'afternoon', 'evening', 'flexible'], default: 'flexible' },
});

// Main User Schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    gender: String,
    profileImage: String,

    // User Preferences (optional)
    preferences: preferenceSchema,

    // Role (required)
    role: {
      type: String,
      enum: ['owner', 'seeker', 'roommate'],
      required: true,
      default: 'seeker',
    },

    // Sub-role for roommates
    subRole: {
      type: String,
      enum: ['hasRoom', 'noRoom'],
      required: function() {
        return this.role === 'roommate';
      }
    },

    // Contact Info
    contactInfo: {
      phone: {
        type: Number,
        validate: {
          validator: function(v) {
            // Basic phone number validation (10 digits)
            return /^\d{10}$/.test(v);
          },
          message: props => `${props.value} is not a valid phone number! Please enter a 10-digit number.`
        }
      },
      email: { type: String, required: true },
      preferredContact: {
        type: String,
        enum: ['phone', 'email', 'both'],
        default: 'email',
      },
    },

    // Flags
    profileComplete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    banned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Validation middleware
userSchema.pre('save', function (next) {
  try {
    // Validate that roommates have a sub-role
    if (this.role === 'roommate' && !this.subRole) {
      return next(new Error('Sub-role (hasRoom/noRoom) is required for roommates'));
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
