import express from 'express';
const router = express.Router();
import { create, update, list, remove } from './rideCategory.controller.js';
import { createRideCategorySchema } from './dto/createRideCategory.dto.js';
import { updateRideCategorySchema } from './dto/updateRideCategory.dto.js';
import { rideCategoryIdParamsSchema } from './dto/rideCategoryIdParams.dto.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import { ADMIN_ROLE, CONTENT_MANAGER_ROLE } from '../auth/auth.constants.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.middleware.js';

router.post(
  '/v1/ride-category',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  validateRequest({ body: createRideCategorySchema }),
  create,
);

router.patch(
  '/v1/ride-category/:id',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  validateRequest({
    params: rideCategoryIdParamsSchema,
    body: updateRideCategorySchema,
  }),
  update,
);

router.get('/v1/ride-categories', list);

router.delete(
  '/v1/ride-category/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  validateRequest({ params: rideCategoryIdParamsSchema }),
  remove,
);

export default router;
