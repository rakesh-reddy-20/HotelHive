const User = require("../models/user");

module.exports.addUser = async (req, res, next) => {
  const { name, contact, email, role, username, password } = req.body.register;

  // Validate role
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
};
