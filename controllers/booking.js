const Booking = require("../models/booking");
const sendOTPEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOTP");
const PendingBooking = require("../models/pendingbooking");
const Listing = require("../models/listing");
const User = require("../models/user");

// render new booking form
module.exports.renderBookingForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).send("Listing not found");
  }
  res.render("bookings/newbooking", { listing });
};

// check avability room is avalibale or not
module.exports.checkAvability = async (req, res) => {
  const { checkIn, checkOut } = req.body;
  const listingId = req.params.id;

  if (!checkIn || !checkOut) {
    return res.status(400).json({
      available: false,
      message: "Check-in and check-out dates are required.",
    });
  }

  try {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    // Normalize check-in and today's date to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const normalizedCheckIn = new Date(startDate);
    normalizedCheckIn.setHours(0, 0, 0, 0);

    // Block same-day bookings
    if (normalizedCheckIn.getTime() === today.getTime()) {
      return res.status(400).json({
        available: false,
        message: "Same-day bookings are not allowed.",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        available: false,
        message: "Check-out must be after check-in.",
      });
    }

    // Find bookings that overlap with the desired date range
    const bookings = await Booking.find({
      listing: listingId,
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate },
    });

    if (bookings.length === 0) {
      return res.json({ available: true });
    } else {
      return res.json({
        available: false,
        message: "Room is already booked for the selected dates.",
      });
    }
  } catch (err) {
    req.flash("error", "Error checking availability!");
    res.redirect(`/listings/${req.params.id}`);
  }
};

// show all bookings
module.exports.allBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing") // optional: shows hotel name, etc.
      .sort({ checkIn: -1 });
    res.render("bookings/mybookings", { bookings });
  } catch (err) {
    res.status(500).send("Error loading your bookings");
  }
};

// store in pending booking
module.exports.pendingBooking = async (req, res) => {
  try {
    const {
      listingId,
      checkIn,
      checkOut,
      guests,
      customerDetails,
      guestsDetails,
      arrivalTime,
      specialRequests,
      paymentMethod,
      totalAmount,
    } = req.body.booking;

    // Check listing existence
    const foundListing = await Listing.findById(listingId);
    if (!foundListing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check user email
    const user = await User.findById(req.user._id);
    if (!user || !user.email) {
      return res.status(400).json({ error: "User email not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Create and save pending booking
    const pendingBooking = new PendingBooking({
      listing: listingId,
      user: req.user._id,
      checkIn,
      checkOut,
      guests,
      customerDetails,
      guestsDetails,
      arrivalTime,
      specialRequests,
      paymentMethod,
      totalAmount,
      otp,
      otpExpiresAt,
    });

    await pendingBooking.save();

    // Send OTP
    await sendOTPEmail(user.email, user.name, otp);

    req.flash("success", "OTP send successfully!");
    // Respond to client
    res.render("bookings/otp", {
      pendingBookingId: pendingBooking._id,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong with your booking." });
  }
};

// verify otp
module.exports.verifyOtp = async (req, res) => {
  const { pendingBookingId, otp } = req.body;

  const pendingBooking = await PendingBooking.findById(pendingBookingId);

  if (!pendingBooking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/listings");
  }

  if (pendingBooking.otp !== otp || pendingBooking.otpExpiresAt < new Date()) {
    pendingBooking.otpAttempts += 1;

    if (pendingBooking.otpAttempts >= 3) {
      await PendingBooking.findByIdAndDelete(pendingBookingId);
      req.flash("error", "Too many incorrect attempts. Booking cancelled.");
      return res.redirect("/listings");
    }

    await pendingBooking.save();

    return res.render("bookings/otp", {
      pendingBookingId: pendingBooking._id,
      errorMessage: `Invalid OTP. Attempts left: ${3 - pendingBooking.otpAttempts}`,
    });
  }

  pendingBooking.otpAttempts = 0;
  await pendingBooking.save();

  req.flash("success", "OTP verified. Proceed to payment.");
  return res.render("bookings/payment", {
    totalAmount: pendingBooking.totalAmount.toFixed(2),
    customerDetails: pendingBooking.customerDetails || { name: "Guest" },
    checkIn: pendingBooking.checkIn,
    checkOut: pendingBooking.checkOut,
    listingPrice: pendingBooking.listingPrice || "N/A",
    taxFees: pendingBooking.taxFees || "0.00",
    pendingBookingId,
    paymentMethod: pendingBooking.paymentMethod,
  });
};

// resend otp
module.exports.resendOtp = async (req, res) => {
  const { pendingBookingId } = req.params;

  const pendingBooking = await PendingBooking.findById(pendingBookingId);

  if (!pendingBooking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/listings");
  }

  const now = new Date();
  const lastSent = pendingBooking.lastEmailSentAt || new Date(0);
  const secondsSinceLast = (now - lastSent) / 1000;

  if (secondsSinceLast < 30) {
    return res.render("bookings/otp", {
      pendingBookingId: pendingBookingId,
      errorMessage: `Please wait ${Math.ceil(30 - secondsSinceLast)} more seconds before resending OTP.`,
    });
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingBooking.otp = otp;
  pendingBooking.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 minutes
  pendingBooking.lastEmailSentAt = now;
  pendingBooking.otpAttempts = 0; // reset attempts on resend
  await pendingBooking.save();

  const user = await User.findById(req.user._id);
  if (!user || !user.email) {
    return res.status(400).json({ error: "User email not found" });
  }

  // Send OTP email
  await sendOTPEmail(user.email, user.name, otp);

  req.flash("success", "OTP resent successfully. Please check your email.");
  return res.render("bookings/otp", {
    pendingBookingId: pendingBooking._id,
  });
};

// final booking
module.exports.finalBooking = async (req, res) => {
  const { pendingBookingId } = req.params;

  const pendingBooking = await PendingBooking.findById(pendingBookingId);
  if (!pendingBooking) {
    req.flash("error", "Booking not found or already completed.");
    return res.redirect("/some-error-page");
  }

  // Save to confirmed bookings
  const booking = new Booking({
    listing: pendingBooking.listing,
    user: pendingBooking.user,
    checkIn: pendingBooking.checkIn,
    checkOut: pendingBooking.checkOut,
    guests: pendingBooking.guests,
    customerDetails: pendingBooking.customerDetails,
    guestsDetails: pendingBooking.guestsDetails,
    arrivalTime: pendingBooking.arrivalTime,
    specialRequests: pendingBooking.specialRequests,
    paymentMethod: pendingBooking.paymentMethod,
    totalAmount: pendingBooking.totalAmount,
  });

  await booking.save();
  await PendingBooking.findByIdAndDelete(pendingBookingId);

  req.flash("success", "Payment successful! Booking confirmed.");
  res.redirect(`/bookings/confirmation/${booking._id}`);
};
