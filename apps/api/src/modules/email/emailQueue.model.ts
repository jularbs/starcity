import mongoose from 'mongoose';
const emailQueueSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      default: 'generic',
      index: true,
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    cc: { type: mongoose.Schema.Types.Mixed },
    bcc: { type: mongoose.Schema.Types.Mixed },
    attachments: { type: mongoose.Schema.Types.Mixed },
    attempts: { type: Number, required: true, default: 0 },
    lastError: { type: String },
    nextAttemptAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

export default mongoose.model('EmailQueue', emailQueueSchema);
