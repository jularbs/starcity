import { z } from 'zod';

export const readPaymentOptionSchema = z.object({
  slug: z.string().min(1, 'Payment Option slug is required'),
});
