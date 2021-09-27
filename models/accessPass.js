const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const accessPassSchema = new mongoose.Schema(
  {
    ticketId: {
      type: ObjectId,
      ref: "Ticket",
    },
    salesId: {
      type: ObjectId,
      ref: "Sale",
    },
    status: {
      type: String,
      required: true,
      default: "for delivery",
    },
    accessToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    QRcode: Object,
    meta: Object,
  },
  { timestamps: true, toJSON: { getters: true } }
);

module.exports = mongoose.model("AccessPass", accessPassSchema);
