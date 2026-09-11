import { Types } from 'mongoose';
import EmailQueue from './emailQueue.model.js';

export type QueuedEmail = {
  type?: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: unknown[];
};

const enqueue = async (email: QueuedEmail) => {
  return EmailQueue.create({
    ...email,
    type: email.type ?? 'generic',
  });
};

const listReady = async () => {
  return EmailQueue.find({
    nextAttemptAt: { $lte: new Date() },
  }).sort({ createdAt: 1 });
};

const remove = async (id: Types.ObjectId) => {
  return EmailQueue.deleteOne({ _id: id });
};

const recordFailure = async (id: Types.ObjectId, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const queueItem = await EmailQueue.findById(id);
  if (!queueItem) return null;

  queueItem.attempts += 1;
  queueItem.lastError = message;
  queueItem.nextAttemptAt = new Date(Date.now() + 5 * 60 * 1000);
  return queueItem.save();
};

export const emailQueueService = {
  enqueue,
  listReady,
  remove,
  recordFailure,
};
