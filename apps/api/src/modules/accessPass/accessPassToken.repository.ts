import { Types } from 'mongoose';
import AccessPassToken from './accessPassToken.model.js';

const storeToken = async (
  saleId: Types.ObjectId,
  token: string,
  expiresAt: Date,
) => {
  const accessPassToken = new AccessPassToken({
    saleId,
    token,
    expiresAt,
  });
  return await accessPassToken.save();
};

const findByToken = async (hashedToken: string) => {
  return await AccessPassToken.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  });
};

const removeAllForSaleId = async (saleId: Types.ObjectId) => {
  return await AccessPassToken.deleteMany({ saleId });
};

export const accessPassTokenRepository = {
  storeToken,
  findByToken,
  removeAllForSaleId,
};
