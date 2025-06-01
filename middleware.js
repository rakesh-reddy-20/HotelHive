const Lisitng = require("./models/listing");
const Review = require("./models/review");
const mongoose = require("mongoose");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must Login");
    return res.redirect("/user/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Lisitng.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "access denied!!!");
    return res.render(`dashboard/allhotels`);
  }
  next();
};

module.exports.isAuthorizedRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      req.flash("error", "You must be logged in!");
      return res.redirect("/users/login");
    }

    if (!allowedRoles.includes(req.user.role)) {
      req.flash("error", "You are not authorized to access the dashboard!");
      return res.redirect("/listings");
    }

    next();
  };
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid listing ID.");
  }

  const listing = await Lisitng.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/dashboard/allhotels");
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that.");
    return res.redirect("/dashboard/allhotels");
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "access denied!!!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
