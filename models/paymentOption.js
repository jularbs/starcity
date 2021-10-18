const mongoose = require("mongoose");

const paymentOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentOption", paymentOptionSchema);
