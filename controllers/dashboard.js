const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const axios = require("axios");

module.exports.renderNewForm = async (req, res, next) => {
  const response = await axios.get("https://restcountries.com/v3.1/all");
  const countries = response.data.map((country) => country.name.common).sort();
  res.render("dashboard/new", { countries });
};

module.exports.uploadForm = async (req, res, next) => {
  const url = req.file.path;
  const filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "Hotel added successfully! Ready for bookings.");
  res.redirect("home");
};

module.exports.showAllHotles = async (req, res, next) => {
  const ownerId = res.locals.currUser._id;
  const allListings = await Listing.find({ owner: ownerId }).lean();
  res.render("dashboard/allhotels", { allListings });
};

module.exports.showHotel = async (req, res) => {
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
    return res.redirect("dashboard/allhotels");
  }
  res.render("dashboard/show", { listing });
};

module.exports.renderUpdateForm = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid listing ID format" });
  }

  const editListing = await Listing.findById(id).lean();
  if (!editListing) {
    req.flash("error", "Hotel does't exist");
    return res.redirect("/dashboard/allhotels");
  }

  let countries = [];
  try {
    // Attempt to fetch countries
    const response = await axios.get("https://restcountries.com/v3.1/all");
    countries = response.data.map((country) => country.name.common).sort();
  } catch (axiosError) {
    console.error("Error fetching countries:", axiosError.message);
  }
  res.render("dashboard/edit", { editListing, countries });
};

module.exports.updateHotel = async (req, res, next) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Hotel details updated successfully!");
  res.redirect(`/dashboard/${id}/showhotel`);
};

module.exports.destroyHotel = async (req, res, next) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Hotel deleted successfully!");
  res.redirect("/dashboard/allhotels");
};
