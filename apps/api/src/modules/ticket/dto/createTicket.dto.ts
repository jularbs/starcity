import { z } from 'zod';

export const createTicketSchema = z.object({
  name: z.string().min(1, 'Ticket name is required'),
  code: z
    .string()
    .min(1, 'Ticket code is required')
    .max(4, 'Ticket code must be at most 4 characters'),
  shortDescription: z.string().min(1, 'Ticket description is required'),
  price: z.coerce.number().min(0, 'Ticket price must be a positive number'),
  details: z.string().min(1, 'Ticket details are required'),
});
