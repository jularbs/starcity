import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const rideCategoryIdParamsSchema = z.object({
  id: ObjectIdSchema,
});
