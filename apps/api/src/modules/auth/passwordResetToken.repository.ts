import { Types } from 'mongoose';
import PasswordResetToken from './passwordResetToken.model.js';

const storeToken = async (
  userId: Types.ObjectId,
  hashedToken: string,
  expiresAt: Date,
) => {
  const newToken = new PasswordResetToken({
    userId,
    token: hashedToken,
    expiresAt,
  });
  await newToken.save();
  return newToken;
};

const findActiveByToken = async (hashedToken: string) => {
  return PasswordResetToken.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  });
};

const consumeByToken = async (hashedToken: string) => {
  return PasswordResetToken.findOneAndDelete({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  });
};

const removeAllForUser = async (userId: Types.ObjectId) => {
  await PasswordResetToken.deleteMany({ userId });
};

export const passwordResetTokenRepository = {
  storeToken,
  findActiveByToken,
  consumeByToken,
  removeAllForUser,
};
