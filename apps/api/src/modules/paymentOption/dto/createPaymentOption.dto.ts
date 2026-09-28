import { z } from 'zod';

export const createPaymentOptionSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .min(1, { error: 'Name cannot be empty' }),
});
