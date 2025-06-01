const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/user");

const MONGO_URI =
  "mongodb+srv://rakeshreddy0263:ankita2018@cluster0.gzwsp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected.");

    const result = await User.updateMany(
      { role: "Admin" }, // Only users with role exactly "Customer"
      { $set: { role: "Owner" } }
    );

    console.log(
      `✅ ${result.modifiedCount} user(s) updated from Customer to Admin.`
    );
    mongoose.connection.close(); // Always close connection when done
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
