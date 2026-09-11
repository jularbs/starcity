import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const imageSliderIdParamsSchema = z.object({
  id: ObjectIdSchema,
});
