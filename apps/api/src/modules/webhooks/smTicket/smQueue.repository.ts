import SmQueue from './smQueue.model.js';

type CreateSmQueue = {
  tokenID: string;
  RideCode: string;
  status: string;
  ticketExpiry?: string;
};

export const smQueueRepository = {
  create: async (data: CreateSmQueue) => {
    const newQ = new SmQueue();
    newQ.tokenID = data.tokenID;
    newQ.RideCode = data.RideCode;
    newQ.status = data.status;
    newQ.ticketExpiry = data.ticketExpiry;

    await newQ.save();
    return newQ;
  },
  remove: async (tokenID: string) => {
    const result = await SmQueue.deleteOne({ tokenID });
    return result;
  },
  list: async () => {
    const result = await SmQueue.find().exec();
    return result;
  },
};
