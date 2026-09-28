import mongoose from 'mongoose';
const paymentOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    meta: Object,
  },
  { timestamps: true },
);

export default mongoose.model('PaymentOption', paymentOptionSchema);
