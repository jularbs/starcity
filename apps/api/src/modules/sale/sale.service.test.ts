import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saleService } from './sale.service.js';
import { saleRepository } from './sale.repository.js';
import { accessPassService } from '../accessPass/accessPass.service.js';
import { accessPassRepository } from '../accessPass/accessPass.repository.js';
import AccessPass from '../accessPass/accessPass.model.js';
import { ticketService } from '../ticket/ticket.service.js';

vi.mock('./sale.repository.js', () => ({
  saleRepository: { findByRefId: vi.fn() },
}));
vi.mock('../accessPass/accessPass.service.js', () => ({
  accessPassService: { getBySalesIdForSync: vi.fn(), syncAccessPass: vi.fn() },
}));
vi.mock('../accessPass/accessPass.model.js', () => ({
  default: { find: vi.fn() },
}));
vi.mock('../ticket/ticket.service.js', () => ({
  ticketService: { getById: vi.fn() },
}));
vi.mock('../promo/promo.service.js', () => ({ promoService: {} }));
vi.mock('../email/email.service.js', () => ({ emailService: {} }));
vi.mock('../../common/utils/get-expiry.js', () => ({
  getOpenParkExpiry: vi.fn(),
}));

describe('sale resync', () => {
  const saleId = new Types.ObjectId();
  const ticketId = new Types.ObjectId();
  const refId = 'D4E04CCE30DF73E1';
  const accessPass = {
    _id: new Types.ObjectId(),
    salesId: saleId,
    ticketId,
    accessToken: 'W-TEST-TOKEN',
    expiryDate: '2026-12-31 23:59:59',
    createdAt: new Date('2026-10-21T00:00:00Z'),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(saleRepository.findByRefId).mockResolvedValue({
      _id: saleId,
    } as never);
    vi.mocked(accessPassService.getBySalesIdForSync).mockResolvedValue([
      accessPass,
    ] as never);
    vi.mocked(ticketService.getById).mockResolvedValue({
      _id: ticketId,
      itemCode: 'TEST',
    } as never);
  });

  it('loads unpopulated access passes without projecting away sync fields', async () => {
    vi.mocked(AccessPass.find).mockResolvedValue([accessPass] as never);

    const result = await accessPassRepository.findBySalesIdForSync(saleId);

    expect(AccessPass.find).toHaveBeenCalledExactlyOnceWith({
      salesId: saleId,
    });
    expect(result).toEqual([accessPass]);
  });

  it('looks up the ticket by ObjectId and syncs the complete access pass', async () => {
    await saleService.resyncSaleByRefId(refId);

    expect(saleRepository.findByRefId).toHaveBeenCalledWith(refId);
    expect(accessPassService.getBySalesIdForSync).toHaveBeenCalledWith(saleId);
    expect(ticketService.getById).toHaveBeenCalledExactlyOnceWith(ticketId);
    expect(accessPassService.syncAccessPass).toHaveBeenCalledExactlyOnceWith(
      accessPass,
      'TEST',
    );
  });

  it('rejects a missing sale before loading access passes', async () => {
    vi.mocked(saleRepository.findByRefId).mockResolvedValue(null);

    await expect(saleService.resyncSaleByRefId(refId)).rejects.toMatchObject({
      code: 'SALE_NOT_FOUND',
    });
    expect(accessPassService.getBySalesIdForSync).not.toHaveBeenCalled();
    expect(accessPassService.syncAccessPass).not.toHaveBeenCalled();
  });

  it('rejects an access pass referencing a missing ticket', async () => {
    vi.mocked(ticketService.getById).mockResolvedValue(null);

    await expect(saleService.resyncSaleByRefId(refId)).rejects.toMatchObject({
      code: 'TICKET_NOT_FOUND',
    });
    expect(accessPassService.syncAccessPass).not.toHaveBeenCalled();
  });
});
