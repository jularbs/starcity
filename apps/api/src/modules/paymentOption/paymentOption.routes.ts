import express from 'express';
const router = express.Router();
import {
  create,
  read,
  publicList,
  manageList,
  update,
  remove,
} from './paymentOption.controller.js';
import { createPaymentOptionSchema } from './dto/createPaymentOption.dto.js';
import { updatePaymentOptionSchema } from './dto/updatePaymentOption.dto.js';
import { paymentOptionIdParamsSchema } from './dto/paymentOptionIdParams.dto.js';
import { readPaymentOptionSchema } from './dto/readPaymentOption.dto.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import { ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE } from '../auth/auth.constants.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.middleware.js';

router.post(
  '/v1/payment-option',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ body: createPaymentOptionSchema }),
  create,
);

router.patch(
  '/v1/payment-option/:id',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({
    body: updatePaymentOptionSchema,
    params: paymentOptionIdParamsSchema,
  }),
  update,
);

router.get('/v1/payment-option', publicList);
router.get(
  '/v1/payment-option/manage',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  manageList,
);

router.get(
  '/v1/payment-option/:slug',
  validateRequest({ params: readPaymentOptionSchema }),
  read,
);

router.delete(
  '/v1/payment-option/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ params: paymentOptionIdParamsSchema }),
  remove,
);

export default router;
