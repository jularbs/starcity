import User from './user.model.js';
import { Types } from 'mongoose';

interface ListParams {
  query?: string;
  department?: string;
  status?: boolean;
}

const findById = async (id: Types.ObjectId) => {
  return User.findById(id);
};

const findByEmail = async (email: string) => {
  return User.findOne({ email });
};

const buildFilter = (params: ListParams) => {
  const filters: Record<string, unknown> = {};
  const andOperator: Record<string, unknown>[] = [];

  if (params.query) {
    const words = params.query.split(' ');
    words.map((word) => {
      andOperator.push({
        name: {
          $regex: `\\b${word.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, '\\$&')}\\b`,
          $options: 'i',
        },
      });
    });
  }

  filters.status = params.status;

  if (params.department) filters.department = params.department;

  if (andOperator.length > 0) {
    filters.$and = andOperator;
  }

  return filters;
};

const list = async ({
  params,
  skip = 0,
  limit = 0,
}: {
  params: ListParams;
  skip?: number;
  limit?: number;
}) => {
  const filters = buildFilter(params);
  return User.find(filters)
    .select(
      '_id name email createdAt department status lastLogin mistakes mfaEnabledAt',
    )
    .skip(skip ?? 0)
    .limit(limit ?? 0)
    .exec();
};

const countDocuments = async (params: ListParams) => {
  const filters = buildFilter(params);
  return User.countDocuments(filters);
};

const updateById = async (
  id: Types.ObjectId,
  update: Record<string, unknown>,
) => {
  return User.findByIdAndUpdate(id, update, { returnDocument: 'after' });
};

const consumeRecoveryCode = async (id: Types.ObjectId, codeHash: string) =>
  User.findOneAndUpdate(
    {
      _id: id,
      mfaEnabledAt: { $ne: null },
      mfaRecoveryCodeHashes: codeHash,
    },
    { $pull: { mfaRecoveryCodeHashes: codeHash } },
    { returnDocument: 'after' },
  );

const updateMfaTotpStep = async (id: Types.ObjectId, step: number) =>
  User.findOneAndUpdate(
    {
      _id: id,
      mfaEnabledAt: { $ne: null },
      $or: [
        { mfaLastTotpStep: { $exists: false } },
        { mfaLastTotpStep: { $lt: step } },
      ],
    },
    { $set: { mfaLastTotpStep: step } },
    { returnDocument: 'after' },
  );

const removeById = async (id: Types.ObjectId) => {
  return User.findByIdAndUpdate(
    id,
    {
      deletedAt: new Date(),
      email: new Date().toISOString(),
    },
    { returnDocument: 'after' },
  );
};

const create = async (user: Record<string, unknown>) => {
  return User.create(user);
};

export const userRepository = {
  findById,
  findByEmail,
  list,
  countDocuments,
  updateById,
  consumeRecoveryCode,
  updateMfaTotpStep,
  removeById,
  create,
};
