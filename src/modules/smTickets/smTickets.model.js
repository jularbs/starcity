import mongoose from "mongoose";
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
    ticketExpiry: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SmTicket", smTicketSchema);