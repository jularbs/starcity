import type { AuthenticatedRequest } from '../../common/types/request.types.js';
import type { Types } from 'mongoose';
import { auditTrailRepository } from './auditTrail.repository.js';
import { getClientIP } from '../../common/utils/client-ip.js';

const list = async (params: {
  filter?: Record<string, any>;
  limit?: number;
  skip?: number;
}) => {
  const auditTrails = await auditTrailRepository.list(params);

  return auditTrails.map((entry) => ({
    userName:
      entry.systemActor ??
      (entry.userId as unknown as { name?: string })?.name ??
      'Unknown',
    action: entry.action,
    payload: entry.payload,
    createdAt: entry.createdAt,
    ipAddress: entry.ipAddress,
  }));
};

const count = async (params: { filter?: Record<string, any> }) => {
  return auditTrailRepository.count(params);
};

const create = async (data: {
  action: string;
  userId?: Types.ObjectId | string;
  systemActor?: string;
  request?: AuthenticatedRequest;
  payload?: Record<string, any>;
}) => {
  const userId = data.userId ?? data.request?.profile?.sub;

  const auditTrailData = {
    userId,
    systemActor: data.systemActor,
    action: data.action,
    ip: data.request ? getClientIP(data.request) : '',
    payload: data.payload,
  };
  return auditTrailRepository.create(auditTrailData);
};

export const auditTrailService = {
  list,
  count,
  create,
};
