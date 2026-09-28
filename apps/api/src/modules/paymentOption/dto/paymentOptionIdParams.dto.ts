import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const paymentOptionIdParamsSchema = z.object({
  id: ObjectIdSchema,
});
