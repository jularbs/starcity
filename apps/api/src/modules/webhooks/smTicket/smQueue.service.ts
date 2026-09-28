import { smQueueRepository } from './smQueue.repository.js';

type CreateSmQueueInput = {
  tokenID: string;
  RideCode: string;
  status?: string;
  ticketExpiry?: string;
};

export const smQueueService = {
  create: async (data: CreateSmQueueInput) => {
    if (!data.status) {
      data.status = 'for delivery';
    }

    const status = data.status || 'for delivery';

    return smQueueRepository.create({
      ...data,
      status: status,
    });
  },
  remove: async (tokenID: string) => {
    return smQueueRepository.remove(tokenID);
  },
  list: async () => {
    return smQueueRepository.list();
  },
};
