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

    try {
      await newQ.save();
      return newQ;
    } catch (err) {
      console.log('ERROR IN QUEUEING SM TICKET: ', err);
      throw err;
    }
  },
  remove: async (tokenID: string) => {
    try {
      const result = await SmQueue.deleteOne({ tokenID });
      return result;
    } catch (err) {
      console.log('ERROR IN REMOVING SM TICKET FROM QUEUE: ', err);
      throw err;
    }
  },
  list: async () => {
    try {
      const result = await SmQueue.find().exec();
      return result;
    } catch (err) {
      console.log('ERROR IN LISTING SM TICKET QUEUE: ', err);
      throw err;
    }
  },
};
