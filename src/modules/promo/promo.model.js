import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema;

const promoSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    campaignName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    percentageDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    fixedDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumRequired: {
      type: Number,
      default: 0,
      min: 0,
    },
    acceptedPaymentMethods: [
      {
        type: ObjectId,
        ref: 'PaymentOption',
      },
    ],
    maxUsage: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    deletedAt: {
      type: Date,
    },
    meta: Object,
  },
  { timestamps: true, toJSON: { getters: true } },
);

promoSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

promoSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

promoSchema.pre('countDocuments', function () {
  this.where({ deletedAt: null });
});

export default mongoose.model('Promo', promoSchema);
