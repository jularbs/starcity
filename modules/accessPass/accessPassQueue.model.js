const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const accessPassQueueSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      default: "for delivery",
    },
    accessPass: {
      type: ObjectId,
      ref: "AccessPass",
    },
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccessPassQueue", accessPassQueueSchema);
