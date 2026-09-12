import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const optionIdParamsSchema = z.object({
  optionId: ObjectIdSchema,
});
