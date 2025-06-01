const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const axios = require("axios");

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

module.exports.renderNewForm = async (req, res) => {
  const response = await axios.get("https://restcountries.com/v3.1/all");
  const countries = response.data.map((country) => country.name.common).sort();
  res.render("dashboard/new", { countries });
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Hotel deleted successfully!");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid listing ID format" });
  }

  const editListing = await Listing.findById(id).lean();
  if (!editListing) {
    req.flash("error", "Hotel does't exist");
    return res.redirect("/listings");
  }

  let countries = [];
  try {
    // Attempt to fetch countries
    const response = await axios.get("https://restcountries.com/v3.1/all");
    countries = response.data.map((country) => country.name.common).sort();
  } catch (axiosError) {
    console.error("Error fetching countries:", axiosError.message);
  }
  res.render("listings/edit", { editListing, countries }); // Ensure this file exists
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Hotel details updated successfully!");
  res.redirect(`/listings/${id}`);
};
