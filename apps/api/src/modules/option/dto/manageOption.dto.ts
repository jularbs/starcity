import { z } from 'zod';

export const manageOptionSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .min(1, { error: 'Name must be at least 1 character' })
    .max(150, { error: 'Name must be at most 150 characters' }),
  slug: z
    .string()
    .min(1, { error: 'Slug is required' })
    .max(150, { error: 'Slug must be at most 150 characters' })
    .optional(),
  value: z.string().nullable(),
});
