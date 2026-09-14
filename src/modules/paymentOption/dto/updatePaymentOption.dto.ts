import { z } from 'zod';
import { BooleanSchema } from '../../../common/schemas/boolean.js';
export const updatePaymentOptionSchema = z.object({
  name: z.string().min(1, 'Payment Option name is required').optional(),
  slug: z.string().min(1, 'Payment Option slug is required').optional(),
  status: BooleanSchema.optional(),
});
