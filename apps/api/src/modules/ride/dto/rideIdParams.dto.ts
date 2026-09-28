import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const rideIdParamsSchema = z.object({
  id: ObjectIdSchema,
});
