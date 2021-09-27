const mongoose = require("mongoose");
const { Decimal128 } = mongoose.Schema.Types;

function getPrice(value) {
  if (typeof value !== "undefined") {
    return parseFloat(value.toString());
  }
  return value;
}

const ticketSchema = new mongoose.Schema(
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
    description: {
      type: String,
    },
    shortDescription: {
      type: String,
    },
    price: {
      type: Decimal128,
      get: getPrice,
      default: 0,
    },
    media: {
      contentType: String,
      location: String,
      key: String,
    },
    status: {
      type: String,
      default: "available",
      required: true,
    },
    itemCode: {
      type: String,
      max: 4,
      trim: true,
    },
    meta: Object,
    id: false,
  },
  { timestamps: true, toJSON: { getters: true } }
);

module.exports = mongoose.model("Ticket", ticketSchema);
