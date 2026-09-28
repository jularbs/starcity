import { z } from 'zod';

export const updateRideCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
});
