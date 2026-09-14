import { z } from 'zod';

export const rideSlugParamsSchema = z.object({
  slug: z.string().min(1, 'Ride slug is required'),
});
