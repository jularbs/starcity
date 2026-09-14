import express from 'express';
const router = express.Router();
import {
  create,
  read,
  update,
  publicList,
  manageList,
  remove,
} from './ticket.controller.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import { ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE } from '../auth/auth.constants.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { createTicketSchema } from './dto/createTicket.dto.js';
import { updateTicketSchema } from './dto/updateTicket.dto.js';
import { ticketIdParamsSchema } from './dto/ticketIdParams.dto.js';
import { ticketSlugParamsSchema } from './dto/ticketSlugParams.dto.js';

router.post(
  '/v1/ticket',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({ body: createTicketSchema }),
  create,
);

router.patch(
  '/v1/ticket/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({
    params: ticketIdParamsSchema,
    body: updateTicketSchema,
  }),
  update,
);

router.get('/v1/ticket', publicList);

router.get(
  '/v1/ticket/manage',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  manageList,
);

router.get(
  '/v1/ticket/:slug',
  validateRequest({
    params: ticketSlugParamsSchema,
  }),
  read,
);

router.delete(
  '/v1/ticket/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE),
  validateRequest({
    params: ticketIdParamsSchema,
  }),
  remove,
);

export default router;
