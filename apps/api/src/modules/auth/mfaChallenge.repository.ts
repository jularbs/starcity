import { Types } from 'mongoose';
import MfaChallenge from './mfaChallenge.model.js';

const create = async (userId: Types.ObjectId, tokenHash: string) =>
  MfaChallenge.create({
    userId,
    tokenHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

const findActive = async (tokenHash: string) =>
  MfaChallenge.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 },
  });

const incrementAttempts = async (tokenHash: string) => {
  const challenge = await MfaChallenge.findOneAndUpdate(
    { tokenHash, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } },
    { $inc: { attempts: 1 } },
    { returnDocument: 'after' },
  );
  if (challenge?.attempts >= 5) {
    await MfaChallenge.deleteOne({ _id: challenge._id });
  }
};

const consume = async (tokenHash: string) =>
  MfaChallenge.findOneAndDelete({
    tokenHash,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 },
  });

const removeAllForUser = async (userId: Types.ObjectId) =>
  MfaChallenge.deleteMany({ userId });

export const mfaChallengeRepository = {
  create,
  findActive,
  incrementAttempts,
  consume,
  removeAllForUser,
};
