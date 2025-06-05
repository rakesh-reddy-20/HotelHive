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
      failureRedirect: "/user/login",
      failureFlash: true,
    }),
    (req, res, next) => {
      const { name, role } = req.user;

      req.flash("success", `Hello ${name}, Welcome to HotelHive!!!`);

      // Role-based redirection
      const roleRedirectMap = {
        Customer: "/listings",
        Owner: "/dashboard/home",
        Admin: "/admin/dashboard",
      };

      const roleBasedRedirect = roleRedirectMap[role];

      // Handle invalid role
      if (!roleBasedRedirect) {
        return req.logout((err) => {
          if (err) return next(err);
          req.flash("error", "Invalid user role. Please contact support.");
          return res.redirect("/user/login");
        });
      }

      // Redirect to saved URL or role-based path
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
