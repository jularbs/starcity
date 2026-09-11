import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: 'Current Password is required' })
      .min(1, { message: 'Current Password is required' }),
    newPassword: z
      .string()
      .regex(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
        message:
          'New Password must be 8 characters long and must contain at least one number, one uppercase letter, and one special character',
      }),
    confirmation: z
      .string({ error: 'Confirmation Password is required' })
      .min(1, { message: 'Confirmation Password is required' }),
  })
  .refine((data) => data.confirmation === data.newPassword, {
    message: 'Passwords do not match',
    path: ['confirmation'],
  });
