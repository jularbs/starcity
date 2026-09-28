import express from 'express';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { transactSchema } from './smTicket/dto/transact.dto.js';
import { voidTransactionSchema } from './smTicket/dto/void.dto.js';
const router = express.Router();

import { bpiTransact } from './bpi/bpi.controller.js';

import {
  paymayaPaymentExpired,
  paymayaPaymentFailed,
  paymayaPaymentSuccess,
} from './paymaya/paymaya.controller.js';

import {
  smTicketTest,
  smTicketExpiry,
  smTicketTransact,
  smTicketVoid,
} from './smTicket/smTicket.controller.js';

router.post('/v1/paymaya/payment-success', paymayaPaymentSuccess);
router.post('/v1/paymaya/payment-failed', paymayaPaymentFailed);
router.post('/v1/paymaya/payment-expired', paymayaPaymentExpired);

router.get('/v1/smticket/test', smTicketTest);
router.get('/v1/smticket/expiry', smTicketExpiry);
router.post(
  '/v1/smticket/transact',
  validateRequest({ body: transactSchema }),
  smTicketTransact,
);
router.patch(
  '/v1/smticket/void',
  validateRequest({ body: voidTransactionSchema }),
  smTicketVoid,
);

router.get('/v1/bpi', bpiTransact);

export default router;
