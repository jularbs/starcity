import { z } from 'zod';
import { BooleanSchema } from '../../../common/schemas/boolean.js';
import escapeHtml from 'escape-html';

export const updateUserSchema = z.object({
  name: z
    .string()
    .transform((val) => escapeHtml(val))
    .optional(),
  email: z.email().optional(),
  department: z.string().optional(),
  status: BooleanSchema.optional(),
});
