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
router.get(
  "/confirmation/:id",
  isLoggedIn,
  wrapAsync(bookingController.finalConfirmation)
);

router.get("/:id/show", isLoggedIn, wrapAsync(bookingController.showBooking));

router.get(
  "/resendotp/:pendingBookingId",
  isLoggedIn,
  wrapAsync(bookingController.resendOtp)
);

router.delete("/:id", wrapAsync(bookingController.cancelBooking));

router.post(
  "/complete/:pendingBookingId",
  isLoggedIn,
  wrapAsync(bookingController.finalBooking)
);

module.exports = router;
