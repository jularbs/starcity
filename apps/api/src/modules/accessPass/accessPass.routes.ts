import express from 'express';
import { config } from '../../config/index.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.middleware.js';
const router = express.Router();

router.get(
  '/v1/accesspass/:token',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many attempts, please try again in 15 minutes.',
    skipSuccessfulRequests: true,
  }),
  (req, res) => {
    const handoffUrl = new URL('/access-pass-session', config.app.websiteUrl);
    handoffUrl.searchParams.set('token', req.params.token as string);
    res.redirect(handoffUrl.toString());
  },
);

export default router;
