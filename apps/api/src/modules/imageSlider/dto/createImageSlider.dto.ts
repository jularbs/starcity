import { z } from 'zod';
import escapeHtml from 'escape-html';

export const createImageSliderSchema = z.object({
  // multipart/form-data fields arrive as strings, so coerce before validating
  order: z.coerce
    .number()
    .int()
    .min(1, { message: 'Order must be a positive integer' }),
  name: z
    .string({ error: 'Name is required' })
    .min(1, { message: 'Name must not be empty' })
    .transform((val) => escapeHtml(val))
    .refine((val) => /^[a-zA-ZÀ-ÿ\s'\-;&]+$/.test(val), {
      message: 'Name contains invalid symbols',
    }),
  startDate: z.coerce.date({ error: 'Start date is required' }),
  endDate: z.coerce.date({ error: 'End date is required' }),
});
