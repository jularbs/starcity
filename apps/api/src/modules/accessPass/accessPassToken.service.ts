import { Types } from 'mongoose';
import { accessPassTokenRepository } from './accessPassToken.repository.js';
import {
  generateAccessPassToken,
  hashAccessPassToken,
} from '../auth/token.helpers.js';

const createAccessPassToken = async (
  saleId: Types.ObjectId,
  expiresAt: Date,
) => {
  const token = generateAccessPassToken();
  const hashedToken = hashAccessPassToken(token);
  const result = await accessPassTokenRepository.storeToken(
    saleId,
    hashedToken,
    expiresAt,
  );

  return {
    token,
    ...result,
  };
};

const findAccessPassTokenByToken = async (hashedToken: string) => {
  return await accessPassTokenRepository.findByToken(hashedToken);
};

const deleteAccessPassTokensForSaleId = async (saleId: Types.ObjectId) => {
  return await accessPassTokenRepository.removeAllForSaleId(saleId);
};

export const accessPassTokenService = {
  createAccessPassToken,
  findAccessPassTokenByToken,
  deleteAccessPassTokensForSaleId,
};
