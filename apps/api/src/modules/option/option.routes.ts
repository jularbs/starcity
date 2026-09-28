import express from 'express';
const router = express.Router();
import { manage, read, readByName, list, remove } from './option.controller.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { optionIdParamsSchema } from './dto/optionIdParams.dto.js';
import { optionSlugParamsSchema } from './dto/optionSlugParams.dto.js';
import { optionNameParamsSchema } from './dto/optionNameParams.dto.js';
import { manageOptionSchema } from './dto/manageOption.dto.js';
import { listOptionSchema } from './dto/listOption.dto.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import {
  ADMIN_ROLE,
  CONTENT_MANAGER_ROLE,
  ECOMMERCE_MANAGER_ROLE,
} from '../auth/auth.constants.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.middleware.js';

router.post(
  '/v1/option',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ body: manageOptionSchema }),
  manage,
);

router.get('/v1/option', validateRequest({ query: listOptionSchema }), list);

router.get(
  '/v1/option/name/:name',
  validateRequest({ params: optionNameParamsSchema }),
  readByName,
);

router.get(
  '/v1/option/:slug',
  validateRequest({ params: optionSlugParamsSchema }),
  read,
);

router.delete(
  '/v1/option/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ params: optionIdParamsSchema }),
  remove,
);

export default router;
