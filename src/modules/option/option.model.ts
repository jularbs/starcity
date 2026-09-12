import mongoose from 'mongoose';
const optionSchema = new mongoose.Schema(
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
    value: {
      type: String,
      nullable: true,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model('Option', optionSchema);
