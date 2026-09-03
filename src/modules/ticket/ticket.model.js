import mongoose from "mongoose";
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
    details: {
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
      type: Boolean,
      default: true,
      required: true,
    },
    itemCode: {
      type: String,
      max: 4,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    meta: Object,
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    id: false,
  }
);

export default mongoose.model("Ticket", ticketSchema);