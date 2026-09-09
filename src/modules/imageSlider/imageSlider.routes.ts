import express from 'express';
const router = express.Router();
import {
  create,
  list,
  update,
  remove,
  toggleStatus,
  read,
} from './imageSlider.controller.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import { ADMIN_ROLE, CONTENT_MANAGER_ROLE } from '../auth/auth.constants.js';

router.post(
  '/v1/image-slider',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  create,
);

router.put(
  '/v1/image-slider',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  update,
);

router.put(
  '/v1/image-slider/toggle-status',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  toggleStatus,
);

router.get('/v1/image-slider', list);
router.get('/v1/image-slider/:slug', read);

router.delete(
  '/v1/image-slider/:slug',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  remove,
);

export default router;
