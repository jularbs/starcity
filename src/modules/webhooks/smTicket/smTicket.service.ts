//TODOS: Regression tests with edge cases
import { format } from 'date-fns';
import { smTicketRepository } from './smTicket.repository.js';
import { getOpenParkExpiry } from '../../../common/utils/get-expiry.js';
import { turnstileSyncService } from '../../turnstileSync/turnstileSync.service.js';
import { smQueueService } from './smQueue.service.js';

type CreateSmTicketInput = {
  tokenId: string;
  ticketType: string;
  ticketExpiry?: string;
};

export const smTicketService = {
  create: async (data: CreateSmTicketInput) => {
    if (!data.tokenId) {
      throw new Error('Token ID is required');
    }

    const expiry = data.ticketExpiry
      ? data.ticketExpiry
      : `${format(new Date(getOpenParkExpiry()), 'yyyy-LL-dd')} 23:59:59`;

    try {
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
      } catch (err) {
        //TODOS: Add to queue
        console.log('ERROR IN SYNCING SM TICKET TO TURNSTILE: ', err);
        smQueueService.create({
          tokenID: data.tokenId,
          RideCode: data.ticketType,
          status: 'for delivery',
          ticketExpiry: expiry,
        });
      }
      return ticket;
    } catch (err) {
      console.log('ERROR IN CREATING SM TICKET: ', err);
      throw err;
    }
  },

  void: async (tokenId: string) => {
    if (!tokenId) {
      throw new Error('Token ID is required');
    }

    try {
      const ticket = await smTicketRepository.void(tokenId);
      await turnstileSyncService.voidAccessPassInTurnstile(tokenId);
      return ticket;
    } catch (err) {
      console.log('ERROR IN VOIDING SM TICKET: ', err);
      throw err;
    }
  },
};
