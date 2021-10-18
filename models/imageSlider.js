const mongoose = require("mongoose");

const imageSliderSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImageSlider", imageSliderSchema);
