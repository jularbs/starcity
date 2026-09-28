import { z } from 'zod';
import { BooleanSchema } from '../../../common/schemas/boolean.js';
import escapeHtml from 'escape-html';

export const updateTicketSchema = z.object({
  name: z.string().min(1, 'Ticket name is required').optional(),
  code: z
    .string()
    .min(1, 'Ticket code is required')
    .max(4, 'Ticket code must be at most 4 characters')
    .transform((val) => escapeHtml(val))
    .optional(),
  shortDescription: z
    .string()
    .min(1, 'Ticket description is required')
    .transform((val) => escapeHtml(val))
    .optional(),
  price: z.coerce
    .number()
    .min(0, 'Ticket price must be a positive number')
    .optional(),
  details: z
    .string()
    .min(1, 'Ticket details are required')
    .transform((val) => escapeHtml(val))
    .optional(),
  status: BooleanSchema.optional(),
  slug: z.string().min(1, 'Ticket slug is required').optional(),
});
