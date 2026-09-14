import { z } from 'zod';

const ticketSchema = z.object({
  ticketID: z
    .string({ error: 'TicketID is required' })
    .min(1, { error: 'Ticket ID is required' }),
  ticketType: z
    .string({ error: 'Ticket Type is required' })
    .min(1, { error: 'Ticket Type is required' }),
  ticketExpiry: z.string({ error: 'Ticket Expiry is required' }).optional(),
});

export const transactSchema = z.object({
  token: z
    .string({ error: 'Auth Token is required' })
    .min(1, { error: 'Auth Token is required' }),
  tickets: z
    .array(ticketSchema)
    .min(1, { error: 'At least one ticket is required' }),
});
