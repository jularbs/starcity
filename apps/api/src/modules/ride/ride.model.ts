import mongoose, { InferSchemaType } from 'mongoose';
const { ObjectId } = mongoose.Schema;

const rideSchema = new mongoose.Schema(
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
    description: {
      type: String,
    },
    meta: Object,
    status: {
      type: String,
      default: 'Open',
      required: true,
    },
    media: {
      bucket: String,
      location: String,
      key: String,
    },
    heightRequirements: {
      type: String,
    },
    rideCategoryId: {
      type: ObjectId,
      ref: 'RideCategory',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export type RideAttributes = InferSchemaType<typeof rideSchema>;
export type CreateRide = Omit<RideAttributes, 'createdAt' | 'updatedAt'>;

export default mongoose.model('Ride', rideSchema);
