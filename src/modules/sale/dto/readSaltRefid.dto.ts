import { z } from 'zod';

export const readSaltRefidSchema = z.object({
  salt: z.string(),
  refid: z.string(),
});
