import { Types } from 'mongoose';
import RefreshToken from './refreshToken.model.js';
import { getRefreshTokenExpirationDate } from './token.helpers.js';

const storeRefreshToken = async (
  userId: Types.ObjectId,
  refreshToken: string,
) => {
  const newRefreshToken = new RefreshToken({
    userId: userId,
    token: refreshToken,
    expiresAt: getRefreshTokenExpirationDate(), // 7 days from now
  });
  await newRefreshToken.save();
  return newRefreshToken;
};

const touchIfActive = async (token: string, idleTimeoutMs: number) => {
  const activityCutoff = new Date(Date.now() - idleTimeoutMs);

  return RefreshToken.findOneAndUpdate(
    {
      token,
      expiresAt: { $gt: new Date() },
      $or: [
        { lastActivityAt: { $gt: activityCutoff } },
        {
          lastActivityAt: { $exists: false },
          createdAt: { $gt: activityCutoff },
        },
      ],
    },
    { $set: { lastActivityAt: new Date() } },
    { returnDocument: 'after' },
  );
};

const removeRefreshTokenByToken = async (token: string) => {
  await RefreshToken.deleteMany({ token });
};

const removeAllForUser = async (userId: Types.ObjectId) => {
  await RefreshToken.deleteMany({ userId });
};

const findByToken = async (token: string) => {
  return RefreshToken.findOne({ token });
};

const consumeByToken = async (token: string) => {
  return RefreshToken.findOneAndDelete({
    token,
    expiresAt: { $gt: new Date() },
  });
};

const consumeIfActive = async (token: string, idleTimeoutMs: number) => {
  const activityCutoff = new Date(Date.now() - idleTimeoutMs);

  return RefreshToken.findOneAndDelete({
    token,
    expiresAt: { $gt: new Date() },
    $or: [
      { lastActivityAt: { $gt: activityCutoff } },
      {
        lastActivityAt: { $exists: false },
        createdAt: { $gt: activityCutoff },
      },
    ],
  });
};

export const refreshTokenRepository = {
  storeRefreshToken,
  touchIfActive,
  removeRefreshTokenByToken,
  removeAllForUser,
  findByToken,
  consumeByToken,
  consumeIfActive,
};
