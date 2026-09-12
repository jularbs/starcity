import { z } from 'zod';

export const getMediaSchema = z.object({
  key: z
    .string({ error: 'Key is required' })
    .min(1, { message: 'Key must not be empty' }),
});
