import { Request } from 'express';
export const getClientIP = (request: Request) => {
  const cfIp = request.headers['cf-connecting-ip'] as string | undefined;
  const ip = Array.isArray(cfIp) ? cfIp[0] : cfIp || request.ip || '';

  return ip;
};
