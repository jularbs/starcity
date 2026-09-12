import { z } from 'zod';

export const optionSlugParamsSchema = z.object({
  slug: z
    .string({ error: 'Option slug is required' })
    .min(1, { message: 'Option slug must not be empty' }),
});
