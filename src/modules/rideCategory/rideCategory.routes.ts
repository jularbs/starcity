import express from 'express';
const router = express.Router();
import { create, update, list, remove } from './rideCategory.controller.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import { ADMIN_ROLE, CONTENT_MANAGER_ROLE } from '../auth/auth.constants.js';

router.post(
  '/v1/ride-category',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  create,
);

router.patch(
  '/v1/ride-category/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  update,
);

router.get('/v1/ride-categories', list);

router.delete(
  '/v1/ride-category/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  remove,
);

export default router;
