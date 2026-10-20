import type { Request, Response } from 'express';
import { accessPassService } from '../accessPass/accessPass.service.js';
import { fromZonedTime } from 'date-fns-tz';
import { saleService } from './sale.service.js';
import { Types } from 'mongoose';
import { createSuccessResponse } from '../../common/utils/success-response.js';
import { accessPassTokenService } from '../accessPass/accessPassToken.service.js';
import { hashAccessPassToken } from '../auth/token.helpers.js';
import { AppError } from '../../common/errors/app-error.js';

export const resendAR = async (req: Request, res: Response) => {
  const { id } = req.body;

  await saleService.resendAcknowledgementReceiptBySaleId(
    id as unknown as Types.ObjectId,
  );
  res.status(200).json(createSuccessResponse({}));
};

//TODOS: Deprecate salt and refID usage 1 month after implementation of session management
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

export const readMyTickets = async (req: Request, res: Response) => {
  const accessPassToken = req.cookies?.accessPassToken;
  if (typeof accessPassToken !== 'string' || !accessPassToken) {
    throw new AppError({
      message: 'Access pass session is required',
      statusCode: 401,
      code: 'ACCESS_PASS_SESSION_REQUIRED',
    });
  }

  const tokenRecord = await accessPassTokenService.findAccessPassTokenByToken(
    hashAccessPassToken(accessPassToken),
  );
  if (!tokenRecord) {
    throw new AppError({
      message: 'Access pass session is invalid or expired',
      statusCode: 401,
      code: 'ACCESS_PASS_SESSION_INVALID',
    });
  }

  const saleData = await saleService.getById(tokenRecord.saleId);
  if (!saleData) {
    throw new AppError({
      message: 'Sale transaction not found',
      statusCode: 404,
      code: 'SALE_NOT_FOUND',
    });
  }

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

  const startDate = fromZonedTime(
    `${start}T00:00:00.000`,
    'Asia/Manila',
  ).toISOString();
  const endDate = fromZonedTime(
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
  const { refid } = req.params;

  await saleService.resyncSaleByRefId(refid as string);
  return res.status(200).json(createSuccessResponse({}));
};
