import express from 'express';
const router = express.Router();
import { userIdParamsSchema } from './dto/userIdParams.dto.js';
import { userListQuerySchema } from './dto/userList.dto.js';
import { updateUserSchema } from './dto/updateUser.dto.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import { ADMIN_ROLE } from '../auth/auth.constants.js';
import {
  remove,
  read,
  list,
  update,
  changePassword,
  unblockUser,
} from './user.controller.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { changePasswordSchema } from './dto/changePassword.dto.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.middleware.js';

const changePasswordRateLimit = createRateLimiter({
  windowMs: 30 * 60 * 1000,
  limit: 10,
  message: 'Too many attempts, please try again in 30 minutes.',
});

router.delete(
  '/v1/user/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE),
  validateRequest({ params: userIdParamsSchema }),
  remove,
);

router.get(
  '/v1/user/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE),
  validateRequest({ params: userIdParamsSchema }),
  read,
);

router.get(
  '/v1/user',
  requireSignin,
  authzMiddleware(ADMIN_ROLE),
  validateRequest({ query: userListQuerySchema }),
  list,
);

router.patch(
  '/v1/user/change-password',
  requireSignin,
  changePasswordRateLimit,
  validateRequest({ body: changePasswordSchema }),
  changePassword,
);

router.patch(
  '/v1/user/unblock/:id',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  requireSignin,
  authzMiddleware(ADMIN_ROLE),
  validateRequest({ params: userIdParamsSchema }),
  unblockUser,
);

router.patch(
  '/v1/user/:id',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  requireSignin,
  authzMiddleware(ADMIN_ROLE),
  validateRequest({ params: userIdParamsSchema, body: updateUserSchema }),
  update,
);

export default router;
