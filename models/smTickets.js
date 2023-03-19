const mongoose = require("mongoose");

const smTicketSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
    },
    method: {
      type: String,
    },
    ticketType: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SmTicket", smTicketSchema);
