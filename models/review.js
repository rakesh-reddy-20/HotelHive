const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, "Comment is required"],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: Schema.Types.ObjectID,
    ref: "User",
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
