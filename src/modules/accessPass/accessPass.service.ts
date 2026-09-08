import { accessPassRepository } from './accessPass.repository.js';
import type { Types } from 'mongoose';

type CreateAccessPassInput = {
  ticketId: Types.ObjectId;
  salesId: Types.ObjectId;
  accessToken: string;
  status: string;
  expiryDate: string;
  QRcode: {
    location: string;
    bucket: string;
    key: string;
  };
};

const create = async (accessPassData: CreateAccessPassInput) => {
  //TODOS: validation if ticketId and salesId exists

  //validate that access token is unique
  const existingAccessPass = await accessPassRepository.findByAccessToken(
    accessPassData.accessToken,
  );
  if (existingAccessPass) {
    throw new Error('Access token must be unique');
  }

  return accessPassRepository.create(accessPassData);
};

const removeBySalesId = async (salesId: Types.ObjectId) => {
  return accessPassRepository.deleteBySalesId(salesId);
};

const removeByBeforeDate = async (date: string) => {
  return accessPassRepository.deleteByBeforeDate(date);
};

const getCountByBeforeDate = async (date: string) => {
  return accessPassRepository.countByBeforeDate(date);
};

const getBySalesId = async (salesId: Types.ObjectId) => {
  return accessPassRepository.findBySalesId(salesId);
};

const getByAccessToken = async (accessToken: string) => {
  return accessPassRepository.findByAccessToken(accessToken);
};

const getInRange = async (startDate: string, endDate: string) => {
  return accessPassRepository.findInRange(startDate, endDate);
};

export const accessPassService = {
  create,
  removeBySalesId,
  removeByBeforeDate,
  getBySalesId,
  getByAccessToken,
  getInRange,
  getCountByBeforeDate,
};
