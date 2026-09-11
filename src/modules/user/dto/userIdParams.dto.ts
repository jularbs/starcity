import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const userIdParamsSchema = z.object({
  id: ObjectIdSchema,
});
