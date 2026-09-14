import { z } from 'zod';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';

const cartSchema = z.object({
  _id: ObjectIdSchema,
  qty: z.coerce
    .number()
    .int({ error: 'Quantity must be an integer' })
    .min(1, { error: 'Quantity must be at least 1' })
    .max(20, { error: 'Quantity must not exceed 20' }),
});

export const createCheckoutSchema = z.object({
  cartItems: z
    .array(cartSchema)
    .min(1, { error: 'Cart must have at least one item' }),
  customerName: z.string().min(1, { error: 'Customer name is required' }),
  emailAddress: z.email({ error: 'Valid email is required' }),
  contactNumber: z.string().min(1, { error: 'Contact number is required' }),
  promoCode: z.string().optional(),
});
