const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const axios = require("axios");

// Home page
module.exports.index = async (req, res) => {
  let allListings = await Listing.find({}).populate("reviews").lean();

  if (allListings.length === 0) {
    return res.status(404).send({ message: "No listings found" });
  }

  allListings = allListings.map((listing) => {
    const total = listing.reviews.reduce((sum, r) => sum + r.rating, 0);
    listing.averageRating =
      listing.reviews.length > 0 ? total / listing.reviews.length : 0;
    return listing;
  });

  res.render("listings/index", { allListings });
};

// Show hotel page
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid listing ID format" });
  }
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner")
    .lean();
  if (!listing) {
    req.flash("error", "Hotel does't exist");
    return res.redirect("/listings");
  }
  if (listing.reviews.length > 0) {
    const total = listing.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    listing.averageRating = (total / listing.reviews.length).toFixed(1); // Rounded to 1 decimal
  } else {
    listing.averageRating = 0;
  }

  res.render("listings/show", { listing });
};
