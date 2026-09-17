import type { Request } from 'express';
import type { AuthenticatedRequest } from '../types/request.types.js';

export const getClientIP = (request: Request | AuthenticatedRequest) => {
  const cfIp = request.headers['cf-connecting-ip'] as string | undefined;
  const ip = Array.isArray(cfIp) ? cfIp[0] : cfIp || request.ip || '';

  return ip;
};
