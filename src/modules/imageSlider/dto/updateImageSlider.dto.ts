import { z } from 'zod';

export const updateImageSliderSchema = z.object({
  // multipart/form-data fields arrive as strings, so coerce before validating
  order: z.coerce
    .number()
    .int()
    .min(1, { message: 'Order must be a positive integer' })
    .optional(),
  slug: z
    .string({ error: 'Slug is required' })
    .min(1, { message: 'Slug must not be empty' })
    .optional(),
  name: z
    .string({ error: 'Name is required' })
    .min(1, { message: 'Name must not be empty' })
    .optional(),
  startDate: z.coerce.date({ error: 'Start date is required' }).optional(),
  endDate: z.coerce.date({ error: 'End date is required' }).optional(),
});
