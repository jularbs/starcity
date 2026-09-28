import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';
import escapeHtml from 'escape-html';

export const updateRideSchema = z.object({
  name: z
    .string()
    .min(1, 'Ride name is required')
    .transform((val) => escapeHtml(val))
    .optional(),
  description: z
    .string()
    .min(1, 'Ride description is required')
    .transform((val) => escapeHtml(val))
    .optional(),
  heightRequirements: z
    .string()
    .min(1, 'Ride height requirement is required')
    .transform((val) => escapeHtml(val))
    .optional(),
  rideCategoryId: ObjectIdSchema.optional(),
  status: z.string().min(1, 'Ride status is required').optional(),
});
