import express from 'express';
import { createPromoSchema } from './dto/createPromo.dto.js';
import { updatePromoSchema } from './dto/updatePromo.dto.js';
import { promoIdParamsSchema } from './dto/promoIdParams.dto.js';
import { applyPromoSchema } from './dto/applyPromo.dto.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
const router = express.Router();
import {
  create,
  read,
  list,
  update,
  remove,
  apply,
} from './promo.controller.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import { ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE } from '../auth/auth.constants.js';

router.post(
  '/v1/promo',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ body: createPromoSchema }),
  create,
);

router.patch(
  '/v1/promo/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ params: promoIdParamsSchema, body: updatePromoSchema }),
  update,
);

router.get(
  '/v1/promo/apply',
  validateRequest({ query: applyPromoSchema }),
  apply,
);

router.get(
  '/v1/promo/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ params: promoIdParamsSchema }),
  read,
);

router.get(
  '/v1/promo',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  list,
);

router.delete(
  '/v1/promo/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ params: promoIdParamsSchema }),
  remove,
);

export default router;
