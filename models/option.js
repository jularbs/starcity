const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
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
    value: {
      type: String,
    },
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Option", optionSchema);
