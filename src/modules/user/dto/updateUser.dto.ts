import { z } from 'zod';
import { BooleanSchema } from '../../../common/schemas/boolean.js';

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  department: z.string().optional(),
  status: BooleanSchema.optional(),
});
