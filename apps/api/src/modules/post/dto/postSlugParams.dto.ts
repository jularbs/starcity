import { z } from 'zod';

export const postSlugParamsSchema = z.object({
  slug: z.string().min(1, { error: 'Slug is required' }),
});
