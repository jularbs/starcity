import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters long' }),
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(8, {
      message: 'Password must be 8 characters long',
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
