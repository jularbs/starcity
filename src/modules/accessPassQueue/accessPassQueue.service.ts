import { accessPassQueueRepository } from './accessPassQueue.repository.js';
import { Types } from 'mongoose';

const createQueue = async (accessPass: Types.ObjectId, status: string) => {
  return accessPassQueueRepository.create(accessPass, status);
};

const listQueues = async () => {
  return accessPassQueueRepository.list();
};

const removeQueue = async (id: Types.ObjectId) => {
  return accessPassQueueRepository.remove(id);
};

export const accessPassQueueService = {
  createQueue,
  listQueues,
  removeQueue,
};
