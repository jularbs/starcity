import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const createRideSchema = z.object({
  name: z.string().min(1, 'Ride name is required'),
  description: z.string().min(1, 'Ride description is required'),
  heightRequirements: z.string().min(1, 'Ride height requirement is required'),
  rideCategoryId: ObjectIdSchema,
  status: z.string().min(1, 'Ride status is required'),
});
