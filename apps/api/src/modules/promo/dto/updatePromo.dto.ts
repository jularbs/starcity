import { z } from 'zod';
import { BooleanSchema } from '../../../common/schemas/boolean.js';
import { ObjectIdSchema } from '../../../common/schemas/objectId.js';
import { Types } from 'mongoose';

export const updatePromoSchema = z
  .object({
    code: z
      .string({ error: 'Code is required' })
      .min(1, { message: 'Code must not be empty' })
      .optional(),
    campaignName: z
      .string({ error: 'Campaign name is required' })
      .min(1, { message: 'Campaign name must not be empty' })
      .optional(),
    startDate: z.coerce.date({ error: 'Start date is required' }).optional(),
    endDate: z.coerce.date({ error: 'End date is required' }).optional(),
    percentageDiscount: z.coerce
      .number({ error: 'Percentage discount is required' })
      .min(0, {
        message: 'Percentage discount must be a non-negative number',
      })
      .max(100, { message: 'Percentage discount must not exceed 100' })
      .refine((value) => !isNaN(value), {
        message: 'Percentage discount must be a number',
      })
      .optional(),
    fixedDiscount: z.coerce
      .number({ error: 'Fixed discount is required' })
      .min(0, { message: 'Fixed discount must be a non-negative number' })
      .refine((value) => !isNaN(value), {
        message: 'Fixed discount must be a number',
      })
      .optional(),
    maxDiscount: z.coerce
      .number({ error: 'Max discount is required' })
      .min(0, { message: 'Max discount must be a non-negative number' })
      .refine((value) => !isNaN(value), {
        message: 'Max discount must be a number',
      })
      .optional(),
    minimumRequired: z.coerce
      .number({ error: 'Minimum required is required' })
      .min(0, { message: 'Minimum required must be a non-negative number' })
      .refine((value) => !isNaN(value), {
        message: 'Minimum required must be a number',
      })
      .optional(),
    maxUsage: z.coerce
      .number({ error: 'Max usage is required' })
      .int({ error: 'Max usage must be an integer' })
      .min(0, { message: 'Max usage must be a non-negative integer' })
      .refine((value) => !isNaN(value), {
        message: 'Max usage must be an integer',
      })
      .optional(),
    status: BooleanSchema.optional(),
    acceptedPaymentMethods: z
      .array(ObjectIdSchema.transform((id) => new Types.ObjectId(id)))
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Only compare when both dates are present in this partial update
    if (!data.startDate || !data.endDate) return;

    if (data.startDate >= data.endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Start date must be before end date',
        path: ['startDate'],
      });
      ctx.addIssue({
        code: 'custom',
        message: 'End date must be after start date',
        path: ['endDate'],
      });
    }
  });
