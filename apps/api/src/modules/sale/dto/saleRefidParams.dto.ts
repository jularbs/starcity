import { z } from 'zod';

export const saleRefidParamsSchema = z.object({
  refid: z.string().min(1, 'Refid is required'),
});
