const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { ref } = require("joi");

// const getRandomImage = () => {
//   const defaultImages = [
//     "https://media.villagetaways.com/villas/bali/3129/8321c21d552d11190bc7c648d9065638_full.jpg",
//     "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
//     "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//   ];
//   type: String,
//   default: getRandomImage,
//   set: (v) => {
//     if (v && typeof v === "object" && v.url) {
//       return v.url.trim(); // Trim the URL string
//     }
//     return v && v.trim() !== "" ? v.trim() : getRandomImage();
//   },
//   return defaultImages[Math.floor(Math.random() * defaultImages.length)];
// };

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    image: {
      url: {
        type: String,
        required: [true, "Image URL is required"],
      },
      filename: {
        type: String,
        required: [true, "Image filename is required"],
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

// Creating the model
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
