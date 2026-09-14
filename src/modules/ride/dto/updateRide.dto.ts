import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const updateRideSchema = z.object({
  name: z.string().min(1, 'Ride name is required').optional(),
  description: z.string().min(1, 'Ride description is required').optional(),
  heightRequirements: z
    .string()
    .min(1, 'Ride height requirement is required')
    .optional(),
  rideCategoryId: ObjectIdSchema.optional(),
  status: z.string().min(1, 'Ride status is required').optional(),
});
