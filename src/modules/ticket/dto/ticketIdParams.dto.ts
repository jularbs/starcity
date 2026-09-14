import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const ticketIdParamsSchema = z.object({
  id: ObjectIdSchema,
});
