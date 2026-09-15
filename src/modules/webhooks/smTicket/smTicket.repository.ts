import SmTicket from './smTicket.model.js';

type CreateSmTicket = {
  tokenId: string;
  method: string;
  ticketType: string;
  ticketExpiry: string;
};

export const smTicketRepository = {
  create: async (data: CreateSmTicket) => {
    const ticket = await SmTicket.create(data);
    return ticket;
  },
  void: async (tokenId: string) => {
    const ticket = await SmTicket.create({ tokenId, method: 'Void' });
    return ticket;
  },
};
