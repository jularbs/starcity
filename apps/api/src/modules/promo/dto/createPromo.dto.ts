import { z } from 'zod';
import { BooleanSchema } from '../../../common/schemas/boolean.js';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';
import { Types } from 'mongoose';
import escapeHtml from 'escape-html';

export const createPromoSchema = z
  .object({
    code: z
      .string({ error: 'Code is required' })
      .min(1, { message: 'Code must not be empty' })
      .transform((val) => escapeHtml(val))
      .refine((val) => /^[a-zA-ZÀ-ÿ0-9'\-;&]+$/.test(val), {
        message: 'Promo Code contains invalid symbols',
      }),
    campaignName: z
      .string({ error: 'Campaign name is required' })
      .min(1, { message: 'Campaign name must not be empty' })
      .transform((val) => escapeHtml(val)),
    startDate: z.coerce.date({ error: 'Start date is required' }),
    endDate: z.coerce.date({ error: 'End date is required' }),
    percentageDiscount: z.coerce
      .number({ error: 'Percentage discount is required' })
      .min(0, { message: 'Percentage discount must be a non-negative number' })
      .max(100, { message: 'Percentage discount must not exceed 100' })
      .refine((value) => !isNaN(value), {
        message: 'Percentage discount must be a number',
      }),
    fixedDiscount: z.coerce
      .number({ error: 'Fixed discount is required' })
      .min(0, { message: 'Fixed discount must be a non-negative number' })
      .refine((value) => !isNaN(value), {
        message: 'Fixed discount must be a number',
      }),
    maxDiscount: z.coerce
      .number({ error: 'Max discount is required' })
      .min(0, { message: 'Max discount must be a non-negative number' })
      .refine((value) => !isNaN(value), {
        message: 'Max discount must be a number',
      }),
    minimumRequired: z.coerce
      .number({ error: 'Minimum required is required' })
      .min(0, { message: 'Minimum required must be a non-negative number' })
      .refine((value) => !isNaN(value), {
        message: 'Minimum required must be a number',
      }),
    maxUsage: z.coerce
      .number({ error: 'Max usage is required' })
      .int({ error: 'Max usage must be an integer' })
      .min(0, { message: 'Max usage must be a non-negative integer' })
      .refine((value) => !isNaN(value), {
        message: 'Max usage must be an integer',
      }),
    status: BooleanSchema.optional(),
    acceptedPaymentMethods: z.array(
      ObjectIdSchema.transform((id) => new Types.ObjectId(id)),
    ),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'Start date must be before end date',
    path: ['startDate', 'endDate'],
  });
