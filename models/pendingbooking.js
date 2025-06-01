const mongoose = require("mongoose");

// Reusable guest schema
const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  aadhaarNumber: {
    type: String,
    required: true,
    match: [/^\d{12}$/, "Aadhaar must be a 12-digit number"],
  },
  age: {
    type: Number,
    required: true,
    min: [0, "Age cannot be negative"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
});

// Function to validate guestsDetails length (max 7 additional guests)
function guestsArrayLimit(val) {
  return val.length <= 7;
}

// PendingBooking schema (before OTP verification)
const pendingBookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    checkIn: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        },
        message: "Check-in date cannot be in the past",
      },
    },
    checkOut: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.checkIn < value;
        },
        message: "Check-out date must be after check-in date",
      },
    },
    guests: {
      type: Number,
      required: true,
      min: [1, "At least one guest is required"],
      max: [8, "Cannot book more than 8 guests"],
    },
    customerDetails: {
      type: guestSchema,
      required: true,
    },
    guestsDetails: {
      type: [guestSchema],
      default: [], // Default empty array
      validate: [
        {
          validator: guestsArrayLimit,
          message: "Guests details exceed max allowed (7 additional guests)",
        },
      ],
    },
    arrivalTime: {
      type: String,
      trim: true,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["creditCard", "upi"], // OTP phase maybe no cash option yet
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount must be a positive number"],
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastEmailSentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Ensure total guests = 1 (customer) + guestsDetails.length
pendingBookingSchema.pre("validate", function (next) {
  const guestsDetailsLength = this.guestsDetails
    ? this.guestsDetails.length
    : 0;
  if (this.guests !== 1 + guestsDetailsLength) {
    this.invalidate(
      "guests",
      "Total guests must equal 1 (customer) + guestsDetails.length"
    );
  }
  next();
});

const PendingBooking = mongoose.model("PendingBooking", pendingBookingSchema);
module.exports = PendingBooking;
