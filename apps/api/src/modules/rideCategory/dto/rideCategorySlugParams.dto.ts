import { z } from 'zod';

export const rideCategorySlugParamsSchema = z.object({
  slug: z.string({ error: 'Slug is required' }).min(1, 'Slug cannot be empty'),
});
