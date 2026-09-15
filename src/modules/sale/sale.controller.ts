import type { Request, Response } from 'express';
import { accessPassService } from '../accessPass/accessPass.service.js';
import dateFnsTz from 'date-fns-tz';
const { zonedTimeToUtc } = dateFnsTz;
import { saleService } from './sale.service.js';
import { Types } from 'mongoose';
import { createSuccessResponse } from '../../common/utils/success-response.js';

export const resendAR = async (req: Request, res: Response) => {
  const { id } = req.body;

  await saleService.resendAcknowledgementReceiptBySaleId(
    id as unknown as Types.ObjectId,
  );
  res.status(200).json(createSuccessResponse({}));
};

export const readBySaltRefID = async (req: Request, res: Response) => {
  const { salt, refid } = req.query;

  const saleData = await saleService.getByRefIdWithSalt(
    refid as string,
    salt as string,
  );

  const accessPasses = await accessPassService.getBySalesId(saleData._id);

  res
    .status(200)
    .json(createSuccessResponse({ ...saleData.toObject(), accessPasses }));
};

export const read = async (req: Request, res: Response) => {
  const { refid } = req.params;
  const data = await saleService.getByRefIdWithDetails(refid as string);
  res.status(200).json(createSuccessResponse(data));
};

export const list = async (req: Request, res: Response) => {
  const { skip = 0, limit = 10, start, end, search = '' } = req.query;

  const startDate = zonedTimeToUtc(
    `${start}T00:00:00.000`,
    'Asia/Manila',
  ).toISOString();
  const endDate = zonedTimeToUtc(
    `${end}T23:59:59.999`,
    'Asia/Manila',
  ).toISOString();

  const data = await saleService.list({
    skip: parseInt(skip as string),
    limit: parseInt(limit as string),
    startDate,
    endDate,
    searchQuery: search as string,
  });

  const count = await saleService.listCount({
    startDate,
    endDate,
    searchQuery: search as string,
  });
  res.status(200).json(
    createSuccessResponse(data, {
      count,
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
      start,
      end,
      search,
    }),
  );
};

export const createCheckout = async (req: Request, res: Response) => {
  const result = await saleService.createCheckout(req.body);
  res.status(200).json(createSuccessResponse(result));
};

export const regenerateAccessPass = async (req: Request, res: Response) => {
  const { id } = req.params;
  await saleService.regenerateAccessPassBySaleId(
    id as unknown as Types.ObjectId,
  );
  return res.status(200).json(createSuccessResponse({}));
};

export const resyncSaleByRefId = async (req: Request, res: Response) => {
  const { id } = req.params;

  await saleService.resyncSaleByRefId(id as string);
  return res.status(200).json(createSuccessResponse({}));
};
