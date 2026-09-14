import { z } from 'zod';

export const listSaleSchema = z.object({
  skip: z.coerce
    .number()
    .int({ error: 'Skip must be an integer' })
    .nonnegative({ error: 'Skip must be a non-negative integer' })
    .optional(),
  limit: z.coerce
    .number()
    .int({ error: 'Limit must be an integer' })
    .nonnegative({ error: 'Limit must be a non-negative integer' })
    .optional(),
  start: z.iso.date(),
  end: z.iso.date(),
  search: z.string().optional(),
});
