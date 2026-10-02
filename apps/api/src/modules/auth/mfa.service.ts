import { Types } from 'mongoose';
import { mfaChallengeRepository } from './mfaChallenge.repository.js';
import {
  createMfaChallenge,
  hashMfaChallenge,
  hashRecoveryCode,
  decryptMfaSecret,
  verifyTotp,
} from './mfa.helpers.js';
import { userService } from '../user/user.service.js';

const createLoginChallengeForUser = async (userId: Types.ObjectId) => {
  const challenge = createMfaChallenge();
  await mfaChallengeRepository.create(userId, hashMfaChallenge(challenge));
  return challenge;
};

const findActiveLoginChallenge = async (challenge: string) =>
  mfaChallengeRepository.findActive(hashMfaChallenge(challenge));

const recordFailedLoginChallengeAttempt = async (challenge: string) =>
  mfaChallengeRepository.incrementAttempts(hashMfaChallenge(challenge));

const consumeLoginChallenge = async (challenge: string) =>
  mfaChallengeRepository.consume(hashMfaChallenge(challenge));

const removeLoginChallengesForUser = async (userId: Types.ObjectId) =>
  mfaChallengeRepository.removeAllForUser(userId);

const verifyUserFactor = async (
  user: {
    _id: Types.ObjectId;
    email: string;
    mfaSecret?: string;
  },
  code: string,
  allowRecoveryCode: boolean,
) => {
  if (/^\d{6}$/.test(code) && user.mfaSecret) {
    const step = verifyTotp(user.email, decryptMfaSecret(user.mfaSecret), code);
    if (step === null) return null;

    const updatedUser = await userService.updateMfaTotpStep(user._id, step);
    return updatedUser ? 'totp' : null;
  }

  if (allowRecoveryCode) {
    const updatedUser = await userService.consumeRecoveryCode(
      user._id,
      hashRecoveryCode(code),
    );
    return updatedUser ? 'recovery' : null;
  }

  return null;
};

export const mfaService = {
  createLoginChallengeForUser,
  findActiveLoginChallenge,
  recordFailedLoginChallengeAttempt,
  consumeLoginChallenge,
  removeLoginChallengesForUser,
  verifyUserFactor,
};
