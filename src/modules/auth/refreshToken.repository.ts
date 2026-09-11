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

const removeRefreshTokenByToken = async (token: string) => {
  await RefreshToken.deleteMany({ token });
};

const findByToken = async (token: string) => {
  return RefreshToken.findOne({ token });
};

export const refreshTokenRepository = {
  storeRefreshToken,
  removeRefreshTokenByToken,
  findByToken,
};
