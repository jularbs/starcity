import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { accessPassQueueRepository } from './accessPassQueue.repository.js';
import { accessPassQueueService } from './accessPassQueue.service.js';

vi.mock('./accessPassQueue.repository.js', () => ({
  accessPassQueueRepository: {
    create: vi.fn(),
    list: vi.fn(),
    remove: vi.fn(),
  },
}));

const repository = vi.mocked(accessPassQueueRepository);

describe('Access pass queue service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createQueue', () => {
    it('delegates the access pass ID and status to the repository', async () => {
      const accessPassId = new Types.ObjectId();
      const queueItem = { _id: new Types.ObjectId(), accessPass: accessPassId };
      repository.create.mockResolvedValue(queueItem as never);

      const result = await accessPassQueueService.createQueue(
        accessPassId,
        'Failed Connection',
      );

      expect(repository.create).toHaveBeenCalledOnce();
      expect(repository.create).toHaveBeenCalledWith(
        accessPassId,
        'Failed Connection',
      );
      expect(result).toBe(queueItem);
    });

    it('passes an empty status through without changing it', async () => {
      const accessPassId = new Types.ObjectId();
      repository.create.mockResolvedValue(null as never);

      const result = await accessPassQueueService.createQueue(accessPassId, '');

      expect(repository.create).toHaveBeenCalledWith(accessPassId, '');
      expect(result).toBeNull();
    });

    it('propagates repository errors', async () => {
      const accessPassId = new Types.ObjectId();
      const error = new Error('Unable to create queue item');
      repository.create.mockRejectedValue(error);

      await expect(
        accessPassQueueService.createQueue(accessPassId, 'Failed Query'),
      ).rejects.toBe(error);
    });
  });

  describe('listQueues', () => {
    it('returns all queue items from the repository', async () => {
      const queueItems = [
        { _id: new Types.ObjectId(), status: 'Failed Query' },
        { _id: new Types.ObjectId(), status: 'Failed Insert' },
      ];
      repository.list.mockResolvedValue(queueItems as never);

      const result = await accessPassQueueService.listQueues();

      expect(repository.list).toHaveBeenCalledOnce();
      expect(repository.list).toHaveBeenCalledWith();
      expect(result).toBe(queueItems);
    });

    it('returns an empty list when the repository has no queue items', async () => {
      repository.list.mockResolvedValue([]);

      const result = await accessPassQueueService.listQueues();

      expect(result).toEqual([]);
    });

    it('propagates repository errors', async () => {
      const error = new Error('Unable to list queue items');
      repository.list.mockRejectedValue(error);

      await expect(accessPassQueueService.listQueues()).rejects.toBe(error);
    });
  });

  describe('removeQueue', () => {
    it('delegates the queue ID and returns the removed item', async () => {
      const queueId = new Types.ObjectId();
      const removedItem = { _id: queueId, status: 'Failed Connection' };
      repository.remove.mockResolvedValue(removedItem as never);

      const result = await accessPassQueueService.removeQueue(queueId);

      expect(repository.remove).toHaveBeenCalledOnce();
      expect(repository.remove).toHaveBeenCalledWith(queueId);
      expect(result).toBe(removedItem);
    });

    it('returns null when the queue item does not exist', async () => {
      const queueId = new Types.ObjectId();
      repository.remove.mockResolvedValue(null);

      const result = await accessPassQueueService.removeQueue(queueId);

      expect(repository.remove).toHaveBeenCalledWith(queueId);
      expect(result).toBeNull();
    });

    it('propagates repository errors', async () => {
      const queueId = new Types.ObjectId();
      const error = new Error('Unable to remove queue item');
      repository.remove.mockRejectedValue(error);

      await expect(accessPassQueueService.removeQueue(queueId)).rejects.toBe(
        error,
      );
    });
  });
});
