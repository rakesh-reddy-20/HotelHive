const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");

const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// contact
router.get("/contact", (req, res) => {
  res.render("listings/contact");
});

// about us
router.get("/aboutus", (req, res) => {
  res.render("listings/aboutUs");
});

router.route("/").get(wrapAsync(listingController.index));

router.route("/:id").get(wrapAsync(listingController.showListing));

module.exports = router;
