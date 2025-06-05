const User = require("../models/user");

module.exports.addUser = async (req, res, next) => {
  const { name, contact, email, role, username, password } = req.body.register;

  // Validate user role
  const allowedRoles = ["Customer", "Owner", "Admin"];
  if (!allowedRoles.includes(role)) {
    req.flash("error", "Invalid user role.");
    return res.redirect("/user/register");
  }

  try {
    // Create user (password will be added by passport-local-mongoose)
    const newUser = new User({ name, contact, email, role, username });

    // Register with hashed password
    const registeredUser = await User.register(newUser, password);

    // Auto-login after registration
    req.login(registeredUser, (error) => {
      if (error) return next(error);

      req.flash("success", `Hello ${name}, welcome to HotelHive!`);

      // Role-based redirection
      let redirectPath = "/listings";
      if (role === "Owner") redirectPath = "/dashboard/home";
      else if (role === "Admin") redirectPath = "/admin/dashboard";

      return res.redirect(redirectPath);
    });
  } catch (err) {
    // Handle duplicate key errors
    if (err.name === "MongoServerError" && err.code === 11000) {
      if (err.keyPattern?.email) {
        req.flash("error", "Email address is already registered.");
      } else if (err.keyPattern?.username) {
        req.flash("error", "Username is already taken.");
      } else {
        req.flash("error", "Duplicate entry detected.");
      }
    } else {
      // Other registration errors
      req.flash("error", err.message || "Registration failed.");
    }
    return res.redirect("/user/register");
  }
};
