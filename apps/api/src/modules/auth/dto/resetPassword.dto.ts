import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: 'Reset token is required' }),
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .max(255, { message: 'Password must be at most 255 characters.' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .max(255, { message: 'Password must be at most 255 characters.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
