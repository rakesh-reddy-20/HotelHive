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

// Max 7 additional guests (customer is already included)
function guestsArrayLimit(val) {
  return val.length <= 7;
}

const bookingSchema = new mongoose.Schema(
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
      default: [],
      validate: {
        validator: guestsArrayLimit,
        message: "Guests details exceed max allowed (7 additional guests)",
      },
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
      enum: ["creditCard", "upi", "cash"],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount must be a positive number"],
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
