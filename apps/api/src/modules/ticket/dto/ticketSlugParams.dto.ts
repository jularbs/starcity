import { z } from 'zod';

export const ticketSlugParamsSchema = z.object({
  slug: z.string().min(1, 'Ticket slug is required'),
});
