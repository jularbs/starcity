import express from 'express';
const router = express.Router();
import { listSaleSchema } from './dto/listSale.dto.js';
import { readSaltRefidSchema } from './dto/readSaltRefid.dto.js';
import { paymayaCheckoutSchema } from './dto/paymayaCheckout.dto.js';
import { createCheckoutSchema } from './dto/createCheckout.dto.js';
import {
  read,
  list,
  createCheckout,
  readBySaltRefID,
  resendAR,
  regenerateAccessPass,
  resyncSaleByRefId,
} from './sale.controller.js';
import { createRateLimiter } from '../../common/middleware/rate-limit.middleware.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import { ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE } from '../auth/auth.constants.js';
import { paymayaRequestCheckout } from '../webhooks/paymaya/paymaya.controller.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { saleIdParamsSchema } from './dto/saleIdParams.dto.js';
import { saleRefidParamsSchema } from './dto/saleRefidParams.dto.js';
import { resendARSchema } from './dto/resendAR.dto.js';

router.get(
  '/v1/sale',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ query: listSaleSchema }),
  list,
);

router.get(
  '/v1/sale/:refid',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 25,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  validateRequest({ params: saleRefidParamsSchema }),
  read,
);

router.get(
  '/v1/access-pass',
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 25,
    message: 'Too many attempts, please try again in 15 minutes.',
  }),
  validateRequest({ query: readSaltRefidSchema }),
  readBySaltRefID,
);

router.post(
  '/v1/paymaya/checkout',
  createRateLimiter({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: 'Too many attempts, please try again in 5 minutes.',
  }),
  validateRequest({ body: paymayaCheckoutSchema }),
  paymayaRequestCheckout,
);

router.post(
  '/v1/create-checkout',
  createRateLimiter({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: 'Too many attempts, please try again in 5 minutes.',
  }),
  validateRequest({ body: createCheckoutSchema }),
  createCheckout,
);

router.post(
  '/v1/sale/resend-email',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ body: resendARSchema }),
  resendAR,
);

router.get(
  '/v1/regenerate-sale/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ params: saleIdParamsSchema }),
  regenerateAccessPass,
);

router.get(
  '/v1/resync-sale/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ params: saleIdParamsSchema }),
  resyncSaleByRefId,
);

export default router;
