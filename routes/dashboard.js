const express = require("express");
const router = express.Router();
const { isLoggedIn, isOwner, isAuthorizedRole } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const multer = require("multer");
const dashboardController = require("../controllers/dashboard.js");
const { listingSchema } = require("../schema.js");

const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// middleware to handle error
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    return next(new ExpressError(400, errMsg));
  } else {
    next();
  }
};

// home page
router.get("/home", isLoggedIn, isAuthorizedRole(["Owner"]), (req, res) => {
  res.render("dashboard/home");
});

// profile page
router.get("/profile", isLoggedIn, isAuthorizedRole(["Owner"]), (req, res) => {
  res.render("dashboard/profile");
});

// need Help page
router.get("/needhelp", isLoggedIn, isAuthorizedRole(["Owner"]), (req, res) => {
  res.render("dashboard/needhelp");
});

// Render New page
router.get(
  "/new",
  isLoggedIn,
  isAuthorizedRole(["Owner"]),
  wrapAsync(dashboardController.renderNewForm)
);

// Add new hotel
router.post(
  "/upload",
  isLoggedIn,
  isAuthorizedRole(["Owner"]),
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(dashboardController.uploadForm)
);

// show all hotels
router.get(
  "/allhotels",
  isLoggedIn,
  isAuthorizedRole(["Owner"]),
  wrapAsync(dashboardController.showAllHotles)
);

// show hotel
router.get(
  "/:id/showhotel",
  isLoggedIn,
  isOwner,
  isAuthorizedRole(["Owner"]),
  wrapAsync(dashboardController.showHotel)
);

// render edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  isAuthorizedRole(["Owner"]),
  wrapAsync(dashboardController.renderUpdateForm)
);

// Update the hotel
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  isAuthorizedRole(["Owner"]),
  wrapAsync(dashboardController.updateHotel)
);

// delete hotel
router.get(
  "/:id/deletehotel",
  isLoggedIn,
  isOwner,
  isAuthorizedRole(["Owner"]),
  wrapAsync(dashboardController.destroyHotel)
);

module.exports = router;
