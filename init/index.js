const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hotelhive";
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");
  } catch (error) {
    console.error(`Error connecting to the database: ${error.message}`);
    process.exit(1);
  }
};

const initDb = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "67d1050d20285285ef4b718c",
    }));
    await Listing.insertMany(initData.data);
    console.log("All listings saved!");
  } catch (error) {
    console.error("Error seeding the database:", error);
    process.exit(1);
  }
};

const start = async () => {
  await connectDB();
  try {
    await initDb();
  } catch (error) {
    console.error("Error seeding the database:", error);
    process.exit(1);
  }
};

start();
