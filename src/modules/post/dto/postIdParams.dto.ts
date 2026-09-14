import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const postIdParamsSchema = z.object({
  id: ObjectIdSchema,
});
