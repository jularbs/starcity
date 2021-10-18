const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const emailQueueSchema = new mongoose.Schema(
  {
    recepient: [
      {
        type: String,
      },
    ],
    sender: {
      type: String,
    },
    body: {
      type: String,
    },
    attachments: [
      {
        type: Object,
      },
    ],
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailQueue", emailQueueSchema);
