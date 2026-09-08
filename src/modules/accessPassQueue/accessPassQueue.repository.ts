import AccessPassQueue from './accessPassQueue.model.js';
import { Types } from 'mongoose';

const create = async (accessPass: Types.ObjectId, status: string) => {
  const queueItem = new AccessPassQueue();
  queueItem.accessPass = accessPass;
  queueItem.status = status;

  const result = await queueItem.save();
  return result;
};

const list = async () => {
  const queueItems = await AccessPassQueue.find().populate('accessPass');
  return queueItems;
};

const remove = async (id: Types.ObjectId) => {
  const result = await AccessPassQueue.findByIdAndDelete(id);
  return result;
};

export const accessPassQueueRepository = {
  create,
  list,
  remove,
};
