import { z } from 'zod';
import escapeHtml from 'escape-html';

export const createRideCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .transform((val) => escapeHtml(val)),
  description: z
    .string()
    .min(1, 'Description is required')
    .transform((val) => escapeHtml(val)),
});
