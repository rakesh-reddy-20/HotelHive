const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router
  .route("/register")
  .get((req, res) => {
    res.render("users/register");
  })
  .post(wrapAsync(userController.addUser));

router
  .route("/login")
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "users/login",
      failureFlash: true,
    }),
    async (req, res) => {
      req.flash("success", `Hello ${req.user.name}, Welcome to HotelHive!!!`);

      let roleBasedRedirect;

      // Handle redirection based on role
      if (req.user.role === "Customer") {
        roleBasedRedirect = "/listings";
      } else if (req.user.role === "Owner") {
        roleBasedRedirect = "/dashboard/home";
      } else if (req.user.role === "Admin") {
        roleBasedRedirect = "/admin/dashboard";
      } else {
        // role is unrecognized, log out the user and redirect to login with an error
        req.logout(() => {
          req.flash("error", "Invalid user role. Please contact support.");
          return res.render("users/login");
        });
        return;
      }
      const redirectUrl = res.locals.redirectUrl || roleBasedRedirect;
      res.redirect(redirectUrl);
    }
  )
  .get((req, res) => {
    res.render("users/login");
  });

// logout
router.get("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    req.flash("success", "User logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
