const User = require("../models/user");

module.exports.addUser = async (req, res, next) => {
  try {
    const { name, contact, email, role, username, password } =
      req.body.register;

    const newUser = new User({ name, contact, email, role, username });

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (error) => {
      if (error) return next(error);

      req.flash("success", `Hello ${name}, welcome to HotelHive!`);
      return res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/user/register");
  }
};

module.exports.addUser = async (req, res, next) => {
  try {
    const { name, contact, email, role, username, password } =
      req.body.register || {};

    // Validate role (optional, but recommended)
    const allowedRoles = ["Customer", "Owner", "Admin"];
    if (!allowedRoles.includes(role)) {
      req.flash("error", "Invalid user role.");
      return res.redirect("/user/register");
    }

    const newUser = new User({ name, contact, email, role, username });

    const registeredUser = await User.register(newUser, password);

    // Auto-login the registered user
    req.login(registeredUser, (error) => {
      if (error) return next(error);

      req.flash("success", `Hello ${name}, welcome to HotelHive!`);

      // Redirect based on role
      let redirectPath = "/listings"; // default
      if (role === "Owner") redirectPath = "/dashboard/home";
      else if (role === "Admin") redirectPath = "/admin/dashboard";

      return res.redirect(redirectPath);
    });
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("error", error.message || "Something went wrong.");
    res.redirect("/user/register");
  }
};
