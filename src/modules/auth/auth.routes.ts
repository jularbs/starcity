import express from 'express';
const router = express.Router();
import {
  signup,
  signin,
  signout,
  changePassword,
  validateToken,
  unblockUser,
  refreshAccessToken,
} from './auth.controller.js';
import { requireSignin } from '../../common/middleware/auth.middleware.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.middleware.js';
import { authzMiddleware } from '../../common/middleware/auth.middleware.js';
import { ADMIN_ROLE } from './auth.constants.js';

router.post(
  '/v1/signup',
  createRateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: 'Too many attempts, please try again in 60 minutes.',
  }),
  signup,
);

router.post(
  '/v1/signin',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  signin,
);

router.post('/v1/change-password', requireSignin, changePassword);

router.post(
  '/v1/refresh-token',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  refreshAccessToken,
);

router.post(
  '/v1/unblock/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE),
  unblockUser,
);

router.get('/v1/signout', signout);

router.get('/v1/validate-token', requireSignin, validateToken);

export default router;
