//TODOS: Regression tests with edge cases
import { format } from 'date-fns';
import { smTicketRepository } from './smTicket.repository.js';
import { getOpenParkExpiry } from '../../../common/utils/get-expiry.js';
import { turnstileSyncService } from '../../turnstileSync/turnstileSync.service.js';
import { smQueueService } from './smQueue.service.js';
import { config } from '../../../config/index.js';
import { AppError } from '../../../common/errors/app-error.js';

type CreateSmTicketInput = {
  tokenId: string;
  ticketType: string;
  ticketExpiry?: string;
};

type TicketsInput = {
  ticketID: string;
  ticketType: string;
  ticketExpiry: string;
};

const create = async (data: CreateSmTicketInput) => {
  if (!data.tokenId) {
    throw new AppError({
      code: 'TOKEN_ID_REQUIRED',
      message: 'Token ID is required',
    });
  }

  const expiry = data.ticketExpiry
    ? data.ticketExpiry
    : `${format(new Date(getOpenParkExpiry()), 'yyyy-LL-dd')} 23:59:59`;

  const ticket = await smTicketRepository.create({
    ...data,
    ticketExpiry: expiry,
    method: 'Purchase',
  });

  try {
    await turnstileSyncService.addAccessPassToTurnstile({
      accesspassCode: data.tokenId,
      origin: 'smticket',
      date: new Date().toISOString(),
      expiry: expiry,
      ticketType: data.ticketType,
    });
  } catch {
    smQueueService.create({
      tokenID: data.tokenId,
      RideCode: data.ticketType,
      status: 'for delivery',
      ticketExpiry: expiry,
    });
  }
  return ticket;
};

const voidTicket = async (tokenId: string) => {
  if (!tokenId) {
    throw new AppError({
      code: 'TOKEN_ID_REQUIRED',
      message: 'Token ID is required',
    });
  }

  const ticket = await smTicketRepository.void(tokenId);
  await turnstileSyncService.voidAccessPassInTurnstile(tokenId);
  return ticket;
};

const processTransaction = async (tickets: TicketsInput[], token: string) => {
  if (token !== config.sm.token) {
    throw new AppError({
      code: 'INVALID_AUTH_TOKEN',
      message: 'Please make sure that your token in your request body is valid',
    });
  }

  const idArray = tickets.map((item) => item.ticketID);
  const existingTickets =
    await turnstileSyncService.getAccessPassInTurnstile(idArray);

  if (existingTickets.length > 0) {
    throw new AppError({
      code: 'TICKET_ID_EXISTS',
      message:
        'One or more Ticket IDs already synchronized, Please provide new Ticket IDs',
      details:
        'Synced Tickets: ' +
        existingTickets.map((ticket) => ticket.admission_no),
    });
  }

  tickets.map(async (item) => {
    const { ticketID, ticketType, ticketExpiry } = item;
    await create({
      tokenId: ticketID,
      ticketType: ticketType,
      ...(ticketExpiry && { ticketExpiry }),
    });
  });
};

const voidTransaction = async (
  tickets: Pick<TicketsInput, 'ticketID'>[],
  token: string,
) => {
  if (token !== config.sm.token) {
    throw new AppError({
      code: 'INVALID_AUTH_TOKEN',
      message: 'Please make sure that your token in your request body is valid',
    });
  }

  for (const item of tickets) {
    await voidTicket(item.ticketID);
  }
};

export const smTicketService = {
  create,
  voidTicket,
  processTransaction,
  voidTransaction,
};
