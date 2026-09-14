import { z } from 'zod';

export const listPostSchema = z.object({
  skip: z.number().int({ error: 'Skip must be an integer' }).min(0).optional(),
  limit: z
    .number()
    .int({ error: 'Limit must be an integer' })
    .min(0)
    .optional(),
});
