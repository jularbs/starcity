import mongoose from "mongoose";
const imageSliderSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      default: 1,
    },
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

export default mongoose.model("ImageSlider", imageSliderSchema);