import express from 'express';
const router = express.Router();
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import { list } from './auditTrail.controller.js';
import { ADMIN_ROLE } from '../auth/auth.constants.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { auditTrailListQuerySchema } from './dto/auditTrailList.dto.js';

router.get(
  '/v1/audit-trail',
  requireSignin,
  authzMiddleware(ADMIN_ROLE),
  validateRequest({ query: auditTrailListQuerySchema }),
  list,
);

export default router;
