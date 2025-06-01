const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const wrapAsync = require("../utils/wrapAsync.js");
const emailConfirmation = require("../utils/emailConfirmation.js");
const CancellationEmail = require("../utils/CancellationEmail.js");
const ExpressError = require("../utils/ExpressError.js");
const bookingController = require("../controllers/booking.js");
const { isLoggedIn } = require("../middleware.js");
const { bookingSchema } = require("../schema.js");

const validateBooking = (req, res, next) => {
  const { error, value } = bookingSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    console.error("Validation error:", errMsg);
    return next(new ExpressError(400, errMsg));
  }

  req.validatedBooking = value;
  next();
};

router.get(
  "/:id/book",
  isLoggedIn,
  wrapAsync(bookingController.renderBookingForm)
);

router.post(
  "/:id/checkavailability",
  isLoggedIn,
  wrapAsync(bookingController.checkAvability)
);

// Show all bookings for logged-in user
router.get("/mybookings", isLoggedIn, wrapAsync(bookingController.allBookings));

router.post(
  "/",
  isLoggedIn,
  validateBooking,
  wrapAsync(bookingController.pendingBooking)
);

router.post("/verifyotp", isLoggedIn, wrapAsync(bookingController.verifyOtp));

// Example Express route handler after booking confirmed
router.get("/confirmation/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("listing")
      .populate("user"); // populate user to access email

    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    const userEmail = booking.user?.email;
    if (userEmail) {
      await emailConfirmation(userEmail, booking);
    }

    res.render("bookings/confirmation", { booking });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get("/:id/show", async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("listing")
      .populate("user"); // populate user as well

    if (!booking) {
      return res.status(404).send("Booking not found.");
    }

    res.render("bookings/show", { booking });
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get(
  "/resendotp/:pendingBookingId",
  isLoggedIn,
  wrapAsync(bookingController.resendOtp)
);

router.delete("/:id", async (req, res) => {
  const bookingId = req.params.id;

  const booking = await Booking.findById(bookingId)
    .populate("listing")
    .populate("user");

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  // Send cancellation email before deletion
  if (booking.user?.email) {
    try {
      await CancellationEmail(booking.user.email, booking);
    } catch (err) {
      console.error("Error sending cancellation email:", err.message);
    }
  }

  await Booking.findByIdAndDelete(bookingId);

  req.flash("success", "Booking Canceled.");
  res.redirect("/bookings/mybookings");
});

router.post(
  "/complete/:pendingBookingId",
  isLoggedIn,
  wrapAsync(bookingController.finalBooking)
);

module.exports = router;
