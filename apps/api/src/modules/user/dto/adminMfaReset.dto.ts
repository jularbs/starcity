import { z } from 'zod';

export const adminMfaResetSchema = z.object({
  reason: z.string().trim().min(8).max(300),
});
