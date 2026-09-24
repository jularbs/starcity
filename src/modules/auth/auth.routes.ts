import express from 'express';
const router = express.Router();
import {
  signup,
  signin,
  signout,
  validateToken,
  refreshAccessToken,
} from './auth.controller.js';
import { requireSignin } from '../../common/middleware/auth.middleware.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.middleware.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { signupSchema } from './dto/signup.dto.js';
import { signinSchema } from './dto/signin.dto.js';
import { refreshTokenSchema } from './dto/refreshtoken.dto.js';
import { signoutSchema } from './dto/signout.dto.js';

router.post(
  '/v1/signup',
  createRateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: 'Too many attempts, please try again in 60 minutes.',
  }),
  validateRequest({ body: signupSchema }),
  signup,
);

router.post(
  '/v1/signin',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  validateRequest({ body: signinSchema }),
  signin,
);

router.post(
  '/v1/refresh-token',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  validateRequest({ cookies: refreshTokenSchema }),
  refreshAccessToken,
);

router.get('/v1/signout', validateRequest({ cookies: signoutSchema }), signout);

router.get('/v1/validate-token', requireSignin, validateToken);

export default router;
