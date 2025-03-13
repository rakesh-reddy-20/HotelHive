const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const axios = require("axios");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({}).lean();
  // if (allListings.length === 0) {
  //   return res.status(404).send({ message: "No listings found" });
  // }
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
  res.render("listings/show", { listing });
};

module.exports.renderNewForm = async (req, res) => {
  const response = await axios.get("https://restcountries.com/v3.1/all");
  const countries = response.data.map((country) => country.name.common).sort();
  res.render("listings/new", { countries });
};

module.exports.createListing = async (req, res, next) => {
  const url = req.file.path;
  const filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "Hotel added successfully! Ready for bookings.");
  res.redirect("/listings");
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
