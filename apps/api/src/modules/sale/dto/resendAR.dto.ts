import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

export const resendARSchema = z.object({
  id: ObjectIdSchema,
});
