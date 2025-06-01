const mongoose = require("mongoose");
const Booking = require("../models/booking"); // adjust path if needed
const PendingBooking = require("../models/pendingbooking"); // adjust path if needed

// Replace with your MongoDB URI
const MONGO_URI =
  "mongodb+srv://rakeshreddy0263:ankita2018@cluster0.gzwsp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function deleteAllBookings() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const bookingResult = await Booking.deleteMany({});
    const pendingResult = await PendingBooking.deleteMany({});

    console.log(`Deleted ${bookingResult.deletedCount} bookings`);
    console.log(`Deleted ${pendingResult.deletedCount} pending bookings`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("Error deleting bookings:", err);
    process.exit(1);
  }
}

deleteAllBookings();
