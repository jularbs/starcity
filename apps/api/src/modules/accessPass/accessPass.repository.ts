import AccessPass from './accessPass.model.js';
import type { Types } from 'mongoose';

type AccessPassData = {
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

const create = async (accessPassData: AccessPassData) => {
  const accessPass = new AccessPass(accessPassData);
  return accessPass.save();
};

const deleteBySalesId = async (salesId: Types.ObjectId) => {
  return AccessPass.deleteMany({ salesId });
};

const deleteByBeforeDate = async (date: string) => {
  return AccessPass.deleteMany({ createdAt: { $lte: date } });
};

const countByBeforeDate = async (date: string) => {
  return AccessPass.countDocuments({ createdAt: { $lte: date } });
};

const findBySalesId = async (salesId: Types.ObjectId) => {
  return AccessPass.find({ salesId })
    .populate('ticketId', 'name slug -_id')
    .select('ticketId QRcode accessToken -_id');
};

const findBySalesIdForSync = async (salesId: Types.ObjectId) => {
  return AccessPass.find({ salesId });
};

const findByAccessToken = async (accessToken: string) => {
  return AccessPass.findOne({ accessToken })
    .populate('ticketId', 'name slug -_id')
    .select('ticketId QRcode accessToken -_id');
};

const findInRange = async (startDate: string, endDate: string) => {
  return AccessPass.find({ createdAt: { $gte: startDate, $lte: endDate } })
    .select('accessToken salesId ticketId createdAt')
    .populate({ path: 'ticketId', model: 'Ticket', select: 'name' })
    .populate({ path: 'salesId', model: 'Sale', select: 'refId' });
};

export const accessPassRepository = {
  create,
  deleteBySalesId,
  deleteByBeforeDate,
  findBySalesId,
  findBySalesIdForSync,
  findByAccessToken,
  findInRange,
  countByBeforeDate,
};
