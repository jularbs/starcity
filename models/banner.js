const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    slug: {
      type: String,
      unique: [true, "Slug is already used."],
      index: true,
      required: true,
    },
    link: {
      type: String,
    },
    image: {
      location: String,
      bucket: String,
      key: String,
    },
    startDate: {
      type: Date,
    },
    endDate: { type: Date },
    status: {
      type: Boolean,
    },
    sizeCategory: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
