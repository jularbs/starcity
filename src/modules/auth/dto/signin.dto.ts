import { z } from 'zod';

export const signinSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z
    .string({ error: 'Password is required' })
    .min(1, { message: 'Password is required' }),
});
