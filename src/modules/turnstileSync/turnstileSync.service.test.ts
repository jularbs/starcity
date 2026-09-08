import { beforeEach, describe, expect, it, vi } from 'vitest';
import { turnstileSyncRepository } from './turnstileSync.repository.js';
import { turnstileSyncService } from './turnstileSync.service.js';

vi.mock('./turnstileSync.repository.js', () => ({
  turnstileSyncRepository: {
    syncAccessPassToTurnstile: vi.fn(),
    voidAccessPassInTurnstile: vi.fn(),
    getAccessPassFromTurnstile: vi.fn(),
  },
}));

const repository = vi.mocked(turnstileSyncRepository);

describe('Turnstile sync service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formats an access pass date and delegates the sync request', async () => {
    repository.syncAccessPassToTurnstile.mockResolvedValue(true);
    const date = new Date(2026, 0, 2, 3, 4, 5);

    const result = await turnstileSyncService.addAccessPassToTurnstile({
      accesspassCode: 'W-RAYC-1234',
      origin: 'web',
      expiry: '2026-02-02 23:59:59',
      date: date.toISOString(),
    });

    expect(repository.syncAccessPassToTurnstile).toHaveBeenCalledWith({
      admission_no: 'W-RAYC-1234',
      date: '2026-01-02',
      time: '03:04:05',
      origin: 'web',
      ticket_type: 'RAYC',
      expiry: '2026-02-02 23:59:59',
    });
    expect(result).toBe(true);
  });

  it('derives a ticket type containing hyphens from between the outer hyphens', async () => {
    repository.syncAccessPassToTurnstile.mockResolvedValue(true);

    await turnstileSyncService.addAccessPassToTurnstile({
      accesspassCode: 'W-FAMILY-VIP-1234',
      origin: 'web',
      expiry: '2026-02-02 23:59:59',
      date: '2026-01-02T03:04:05.000Z',
    });

    expect(repository.syncAccessPassToTurnstile).toHaveBeenCalledWith(
      expect.objectContaining({
        admission_no: 'W-FAMILY-VIP-1234',
        ticket_type: 'FAMILY-VIP',
      }),
    );

    expect(repository.syncAccessPassToTurnstile).toHaveBeenCalledTimes(1);
  });

  it('rejects malformed access-pass codes without calling the repository', async () => {
    await expect(
      turnstileSyncService.addAccessPassToTurnstile({
        accesspassCode: 'INVALID-CODE',
        origin: 'web',
        expiry: '2026-02-02 23:59:59',
        date: '2026-01-02T03:04:05.000Z',
      }),
    ).rejects.toThrow(TypeError);

    expect(repository.syncAccessPassToTurnstile).not.toHaveBeenCalled();
  });

  it('uses the current date when no access pass date is provided', async () => {
    repository.syncAccessPassToTurnstile.mockResolvedValue(false);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 2, 3, 4, 5));

    try {
      await turnstileSyncService.addAccessPassToTurnstile({
        accesspassCode: 'W-RAYC-5678',
        origin: 'smticket',
        expiry: '2026-02-02 23:59:59',
      });

      expect(repository.syncAccessPassToTurnstile).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2026-01-02',
          origin: 'smticket',
        }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('delegates voiding an access pass', async () => {
    repository.voidAccessPassInTurnstile.mockResolvedValue(true);

    const result =
      await turnstileSyncService.voidAccessPassInTurnstile('W-RAYC-1234');

    expect(repository.voidAccessPassInTurnstile).toHaveBeenCalledWith(
      'W-RAYC-1234',
    );
    expect(result).toBe(true);
  });

  it('propagates a MySQL error when syncing an access pass fails', async () => {
    const databaseError = new Error('MySQL connection failed');
    repository.syncAccessPassToTurnstile.mockRejectedValue(databaseError);

    await expect(
      turnstileSyncService.addAccessPassToTurnstile({
        accesspassCode: 'W-RAYC-1234',
        origin: 'web',
        expiry: '2026-02-02 23:59:59',
        date: '2026-01-02T03:04:05.000Z',
      }),
    ).rejects.toBe(databaseError);
  });

  it('propagates a MySQL error when voiding an access pass fails', async () => {
    const databaseError = new Error('MySQL update failed');
    repository.voidAccessPassInTurnstile.mockRejectedValue(databaseError);

    await expect(
      turnstileSyncService.voidAccessPassInTurnstile('W-RAYC-1234'),
    ).rejects.toBe(databaseError);
  });

  it('returns true when all access passes are present in Turnstile', async () => {
    repository.getAccessPassFromTurnstile.mockResolvedValue([
      {
        admission_no: 'W-RAYC-1234',
        date: '2026-01-02',
        time: '03:04:05',
        origin: 'web',
        ticket_type: 'RAYC',
        expiry: '2026-02-02 23:59:59',
      },
      {
        admission_no: 'W-RAYC-5678',
        date: '2026-01-02',
        time: '03:04:05',
        origin: 'web',
        ticket_type: 'RAYC',
        expiry: '2026-02-02 23:59:59',
      },
    ]);

    const result = await turnstileSyncService.isTransactionCompleteInTurnstile([
      'W-RAYC-1234',
      'W-RAYC-5678',
    ]);

    expect(repository.getAccessPassFromTurnstile).toHaveBeenCalledWith([
      'W-RAYC-1234',
      'W-RAYC-5678',
    ]);
    expect(result).toBe(true);
  });

  it('returns false when Turnstile has fewer access passes than requested', async () => {
    repository.getAccessPassFromTurnstile.mockResolvedValue([
      {
        admission_no: 'W-RAYC-1234',
        date: '2026-01-02',
        time: '03:04:05',
        origin: 'web',
        ticket_type: 'RAYC',
        expiry: '2026-02-02 23:59:59',
      },
    ]);

    const result = await turnstileSyncService.isTransactionCompleteInTurnstile([
      'W-RAYC-1234',
      'W-RAYC-5678',
    ]);

    expect(result).toBe(false);
  });

  it('propagates a MySQL error when checking transaction completeness fails', async () => {
    const databaseError = new Error('MySQL read failed');
    repository.getAccessPassFromTurnstile.mockRejectedValue(databaseError);

    await expect(
      turnstileSyncService.isTransactionCompleteInTurnstile(['W-RAYC-1234']),
    ).rejects.toBe(databaseError);
  });

  it('returns missing access pass codes', async () => {
    repository.getAccessPassFromTurnstile.mockResolvedValue([
      {
        admission_no: 'W-RAYC-1234',
        date: '2026-01-02',
        time: '03:04:05',
        origin: 'web',
        ticket_type: 'RAYC',
        expiry: '2026-02-02 23:59:59',
      },
    ]);

    const result = await turnstileSyncService.getMissingAccessPassesInTurnstile(
      ['W-RAYC-1234', 'W-RAYC-5678'],
    );

    expect(result).toEqual(['W-RAYC-5678']);
  });

  it('propagates a MySQL error when finding missing access passes fails', async () => {
    const databaseError = new Error('MySQL query failed');
    repository.getAccessPassFromTurnstile.mockRejectedValue(databaseError);

    await expect(
      turnstileSyncService.getMissingAccessPassesInTurnstile(['W-RAYC-1234']),
    ).rejects.toBe(databaseError);
  });
});
