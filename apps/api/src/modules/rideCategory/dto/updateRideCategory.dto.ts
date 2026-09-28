import { z } from 'zod';
import escapeHtml from 'escape-html';
export const updateRideCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .transform((val) => escapeHtml(val))
    .optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .transform((val) => escapeHtml(val))
    .optional(),
});
