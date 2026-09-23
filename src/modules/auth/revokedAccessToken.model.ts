import mongoose from 'mongoose';

const revokedAccessTokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

revokedAccessTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RevokedAccessToken', revokedAccessTokenSchema);
