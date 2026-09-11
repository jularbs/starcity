import { z } from 'zod';
import { BooleanSchema } from '../../../common/schemas/boolean.js';
export const userListQuerySchema = z.object({
  query: z.string().optional(),
  department: z.string().optional(),
  skip: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  status: BooleanSchema.optional(),
});
