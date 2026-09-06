import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    hashed_password: {
      type: String,
      require: true,
    },
    salt: String,
    status: {
      type: Boolean,
      default: false,
      require: true,
    },
    department: {
      type: String,
      default: 'admin',
    },
    deletedAt: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    mistakes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

userSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

userSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

userSchema.pre('countDocuments', function () {
  this.where({ deletedAt: null });
});

export default mongoose.model('User', userSchema);
