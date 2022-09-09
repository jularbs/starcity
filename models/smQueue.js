const mongoose = require("mongoose");

const smQueueSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      default: "for delivery",
    },
    tokenID: {
      type: String,
      require: true,
    },
    RideCode: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SmQueue", smQueueSchema);
