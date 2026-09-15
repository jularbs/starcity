import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { getClientIP } from '../utils/client-ip.js';

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
      error: { code: 'RATE_LIMIT_EXCEEDED', message },
    },
    keyGenerator: (req) => ipKeyGenerator(getClientIP(req)),
  });
}

export function catchAllLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 25,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message:
          'Too many failed 404 requests from this IP, please try again after 15 minutes',
      },
    },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => ipKeyGenerator(getClientIP(req)),
  });
}
