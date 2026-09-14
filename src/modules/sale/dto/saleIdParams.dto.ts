import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const saleIdParamsSchema = z.object({
  id: ObjectIdSchema,
});
