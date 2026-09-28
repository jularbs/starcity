import { z } from 'zod';

export const imageSliderSlugParamsSchema = z.object({
  slug: z.string().min(1, { message: 'Slug must not be empty' }),
});
