import express from 'express';
const router = express.Router();
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import { ADMIN_ROLE } from '../auth/auth.constants.js';
import { remove, read, list, update } from './user.controller.js';

router.delete(
  '/v1/user/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE),
  remove,
);

router.get('/v1/user/:id', requireSignin, authzMiddleware(ADMIN_ROLE), read);

router.get('/v1/user', requireSignin, authzMiddleware(ADMIN_ROLE), list);

router.patch('/v1/user', requireSignin, authzMiddleware(ADMIN_ROLE), update);

export default router;
