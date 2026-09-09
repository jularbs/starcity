import { Request } from 'express';
import { auditTrailRepository } from './auditTrail.repository.js';
import { getClientIP } from '../../common/utils/client-ip.js';

const list = async (params: {
  filter?: Record<string, any>;
  limit?: number;
  skip?: number;
}) => {
  return auditTrailRepository.list(params);
};

const count = async (params: { filter?: Record<string, any> }) => {
  return auditTrailRepository.count(params);
};

const create = async (data: {
  action: string;
  user?: string;
  request?: Request;
  payload?: Record<string, any>;
}) => {
  const user = data.user
    ? data.user
    : data.request
      ? data.request.profile?.name
      : '';

  const auditTrailData = {
    user: user,
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
