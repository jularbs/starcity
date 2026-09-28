import { z } from 'zod';
import escapeHtml from 'escape-html';
export const createPaymentOptionSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .min(1, { error: 'Name cannot be empty' })
    .transform((val) => escapeHtml(val)),
});
