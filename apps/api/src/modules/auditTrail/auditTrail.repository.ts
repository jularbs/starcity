import AuditTrail from './auditTrail.model.js';
import type { Types } from 'mongoose';

const list = async ({
  filter = {},
  limit = 10,
  skip = 0,
}: {
  filter?: Record<string, any>;
  limit?: number;
  skip?: number;
}) => {
  return AuditTrail.find(filter)
    .select('userId systemActor action payload createdAt ipAddress -_id')
    .populate({ path: 'userId', select: 'name -_id' })
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .exec();
};

const count = async ({ filter = {} }: { filter?: Record<string, any> }) => {
  return AuditTrail.countDocuments(filter).exec();
};

const create = async (data: {
  action: string;
  ip: string;
  userId?: Types.ObjectId | string;
  systemActor?: string;
  payload?: Record<string, any>;
}) => {
  return AuditTrail.create({
    userId: data.userId,
    systemActor: data.systemActor,
    action: data.action,
    ipAddress: data.ip,
    payload: data.payload,
  });
};

export const auditTrailRepository = {
  list,
  count,
  create,
};
