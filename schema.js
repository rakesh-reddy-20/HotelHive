const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow("", null),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().min(5).max(500).required(),
    rating: Joi.number().min(1).max(5).required(),
  }).required(),
});

const guestSchema = Joi.object({
  name: Joi.string().trim().required(),
  aadhaarNumber: Joi.string()
    .pattern(/^\d{12}$/)
    .required()
    .messages({
      "string.pattern.base": "Aadhaar must be a 12-digit number",
    }),
  age: Joi.number().min(0).required(),
  gender: Joi.string().valid("male", "female", "other").required(),
});

// Inner booking object schema
const bookingOnlySchema = Joi.object({
  listingId: Joi.string().required(),
  checkIn: Joi.date().min("now").required(),
  checkOut: Joi.date().greater(Joi.ref("checkIn")).required(),
  guests: Joi.number().min(1).max(8).required(),
  customerDetails: guestSchema.required(),
  guestsDetails: Joi.array().items(guestSchema).max(7).optional().default([]),
  arrivalTime: Joi.string().trim().allow("", null),
  specialRequests: Joi.string().trim().allow("", null),
  paymentMethod: Joi.string().valid("creditCard", "upi", "cash").required(),
  totalAmount: Joi.number().min(0).required(),
}).custom((value, helpers) => {
  const guestsDetailsLength = value.guestsDetails
    ? value.guestsDetails.length
    : 0;
  const expectedGuests = 1 + guestsDetailsLength;
  if (value.guests !== expectedGuests) {
    return helpers.message(
      `Total guests (${value.guests}) must equal 1 (customer) + guestsDetails (${guestsDetailsLength})`
    );
  }
  return value;
}, "Guests count validation");

// Exported Joi schema expecting { booking: { ... } }
module.exports.bookingSchema = Joi.object({
  booking: bookingOnlySchema.required(),
});
