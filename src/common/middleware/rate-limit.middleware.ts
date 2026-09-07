import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

function getClientIp(req: Request): string {
  const cfIp = req.headers['cf-connecting-ip'];
  const ip = Array.isArray(cfIp) ? cfIp[0] : cfIp;
  return ipKeyGenerator(ip || req.ip || '');
}

export function createRateLimiter({
  windowMs,
  limit,
  message = 'Too many requests. Please try again later.',
}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: 'RATE_LIMIT_EXCEEDED',
      message,
    },
    keyGenerator: (req) => getClientIp(req),
  });
}

export function catchAllLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 25,
    message: {
      error: 'RATE_LIMIT_EXCEEDED',
      message:
        'Too many failed 404 requests from this IP, please try again after 15 minutes',
    },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => getClientIp(req),
  });
}
