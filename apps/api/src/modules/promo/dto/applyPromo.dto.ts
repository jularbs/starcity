import { z } from 'zod';

export const applyPromoSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
  transactionAmount: z.coerce
    .number({
      error: (issue) => {
        if (issue.code === 'invalid_type') {
          return 'Please enter a valid numeric value';
        }
        return 'Please enter a valid numeric value';
      },
    })
    .refine((value) => value >= 0, {
      message: 'Transaction amount must be a positive number',
    }),
});
