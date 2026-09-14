import { z } from 'zod';

export const PaymentOptionSlugParamsSchema = z.object({
  slug: z.string({ error: 'Slug is required' }),
});
