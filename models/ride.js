const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const rideSchema = new mongoose.Schema(
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
    meta: Object,
    status: {
      type: String,
      default: "Open",
      required: true,
    },
    media: {
      contentType: String,
      location: String,
      key: String,
    },
    heightRequirements: {
      type: String,
    },
    rideCategoryId: {
      type: ObjectId,
      ref: "RideCategory",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
