const User = require("../models/user");
module.exports.addUser = async (req, res) => {
  try {
    const { name, contact, email, username, password } = req.body.register;
    const newUser = new User({ name, contact, email, username });
    const registerUser = await User.register(newUser, password);
    req.login(registerUser, (error) => {
      if (error) {
        next(error);
      }
      req.flash("success", `Hello ${name} welcome to hotelhive!`);
      res.redirect("/listings");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/user/register");
  }
};
