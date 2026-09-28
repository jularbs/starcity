import { z } from 'zod';
import { BooleanSchema } from '../../../common/schemas/boolean.js';
import escapeHtml from 'escape-html';

export const updatePaymentOptionSchema = z.object({
  name: z
    .string()
    .min(1, 'Payment Option name is required')
    .transform((val) => escapeHtml(val))
    .refine((val) => /^[a-zA-ZÀ-ÿ\s'\-;&]+$/.test(val), {
      message: 'Name contains invalid symbols',
    })
    .optional(),
  slug: z.string().min(1, 'Payment Option slug is required').optional(),
  status: BooleanSchema.optional(),
});
