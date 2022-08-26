const mongoose = require("mongoose");

const emailQueueSchema = new mongoose.Schema(
  {
    refId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailQueue", emailQueueSchema);
