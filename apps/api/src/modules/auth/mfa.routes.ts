import express from 'express';
import { z } from 'zod';
import { createRateLimiter } from '../../common/middleware/rate-limit.middleware.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { requireSignin } from '../../common/middleware/auth.middleware.js';
import {
  beginMfaSetup,
  confirmMfaSetup,
  disableMfa,
  getMfaStatus,
  regenerateRecoveryCodes,
} from './mfa.controller.js';
import { verifySigninMfa } from './auth.controller.js';

const router = express.Router();
const codeSchema = z.string().trim().min(6).max(32);
const passwordSchema = z.string().min(1);

router.post(
  '/v1/signin/mfa',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many verification attempts. Please try again later.',
  }),
  validateRequest({
    body: z.object({
      challengeToken: z.string().regex(/^[a-f0-9]{64}$/i),
      code: codeSchema,
    }),
  }),
  verifySigninMfa,
);

router.get('/v1/mfa/status', requireSignin, getMfaStatus);

router.post(
  '/v1/mfa/setup',
  requireSignin,
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: 'Too many MFA setup attempts. Please try again later.',
  }),
  validateRequest({ body: z.object({ currentPassword: passwordSchema }) }),
  beginMfaSetup,
);

router.post(
  '/v1/mfa/enable',
  requireSignin,
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many verification attempts. Please try again later.',
  }),
  validateRequest({ body: z.object({ code: z.string().regex(/^\d{6}$/) }) }),
  confirmMfaSetup,
);

router.post(
  '/v1/mfa/disable',
  requireSignin,
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: 'Too many MFA changes. Please try again later.',
  }),
  validateRequest({
    body: z.object({ currentPassword: passwordSchema, code: codeSchema }),
  }),
  disableMfa,
);

router.post(
  '/v1/mfa/recovery-codes',
  requireSignin,
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: 'Too many recovery-code requests. Please try again later.',
  }),
  validateRequest({
    body: z.object({
      currentPassword: passwordSchema,
      code: z.string().regex(/^\d{6}$/),
    }),
  }),
  regenerateRecoveryCodes,
);

export default router;
