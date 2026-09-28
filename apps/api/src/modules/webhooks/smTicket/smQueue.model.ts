import mongoose from 'mongoose';
const smQueueSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      default: 'for delivery',
    },
    tokenID: {
      type: String,
      require: true,
    },
    ticketExpiry: {
      type: String,
    },
    RideCode: { type: String, require: true },
  },
  { timestamps: true },
);

export default mongoose.model('SmQueue', smQueueSchema);
