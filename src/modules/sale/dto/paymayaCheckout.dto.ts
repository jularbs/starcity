import { z } from 'zod';

export const paymayaCheckoutSchema = z.object({
  refId: z.string(),
  customerFirstName: z.string(),
  customerLastName: z.string(),
});
