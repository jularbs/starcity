import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const promoIdParamsSchema = z.object({
  id: ObjectIdSchema,
});
