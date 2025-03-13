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
      failureRedirect: "/user/login", // Ensure correct path
      failureFlash: true,
    }),
    async (req, res) => {
      req.flash("success", "welcome to hotelhive");
      const redirectUrl = res.locals.redirectUrl || "/listings";
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
