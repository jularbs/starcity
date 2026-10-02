import { userRepository } from './user.repository.js';
import { Types } from 'mongoose';

const getById = async (id: Types.ObjectId) => {
  return userRepository.findById(id);
};

const getByEmail = async (email: string) => {
  return userRepository.findByEmail(email);
};

const list = async ({
  params,
  skip = 0,
  limit = 0,
}: {
  params: Record<string, unknown>;
  skip?: number;
  limit?: number;
}) => {
  return userRepository.list({ params, skip, limit });
};

const countUsers = async (filter: Record<string, unknown> = {}) => {
  return userRepository.countDocuments(filter);
};

const updateById = async (
  id: Types.ObjectId,
  update: Record<string, unknown>,
) => {
  return userRepository.updateById(id, update);
};

const consumeRecoveryCode = async (id: Types.ObjectId, codeHash: string) =>
  userRepository.consumeRecoveryCode(id, codeHash);

const updateMfaTotpStep = async (id: Types.ObjectId, step: number) =>
  userRepository.updateMfaTotpStep(id, step);

const removeById = async (id: Types.ObjectId) => {
  return userRepository.removeById(id);
};

const create = async (user: Record<string, unknown>) => {
  return userRepository.create(user);
};

const resetMistakes = async (id: Types.ObjectId) => {
  return userRepository.updateById(id, { mistakes: 0 });
};

export const userService = {
  getById,
  getByEmail,
  countUsers,
  list,
  updateById,
  consumeRecoveryCode,
  updateMfaTotpStep,
  removeById,
  create,
  resetMistakes,
};
