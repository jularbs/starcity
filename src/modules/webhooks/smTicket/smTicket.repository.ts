import SmTicket from './smTicket.model.js';

type CreateSmTicket = {
  tokenId: string;
  method: string;
  ticketType: string;
  ticketExpiry: string;
};

export const smTicketRepository = {
  create: async (data: CreateSmTicket) => {
    try {
      const ticket = await SmTicket.create(data);
      return ticket;
    } catch (err) {
      console.log('ERROR IN RECORDING SM TICKET: ', err);
      throw err;
    }
  },
  void: async (tokenId: string) => {
    try {
      const ticket = await SmTicket.create({ tokenId, method: 'Void' });
      return ticket;
    } catch (err) {
      console.log('ERROR IN VOIDING SM TICKET: ', err);
      throw err;
    }
  },
};
