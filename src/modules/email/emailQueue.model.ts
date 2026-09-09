import mongoose from 'mongoose';
const emailQueueSchema = new mongoose.Schema(
  {
    refId: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model('EmailQueue', emailQueueSchema);
