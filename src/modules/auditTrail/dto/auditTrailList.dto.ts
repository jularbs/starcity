import { z } from 'zod';

export const auditTrailListQuerySchema = z.object({
  skip: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
