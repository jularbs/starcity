import { z } from 'zod';

export const optionNameParamsSchema = z.object({
  name: z
    .string({ error: 'Option name is required' })
    .min(1, { message: 'Option name must not be empty' }),
});
