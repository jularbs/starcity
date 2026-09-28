import { promoService } from './promo.service.js';
import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../common/utils/success-response.js';
import { Types } from 'mongoose';

export const create = async (req: Request, res: Response) => {
  const result = await promoService.create(req.body);
  return res.status(201).json(createSuccessResponse(result));
};

export const read = async (req: Request, res: Response) => {
  const { id } = req.params;

  const promo = await promoService.getById(id as unknown as Types.ObjectId);
  return res.status(200).json(createSuccessResponse(promo));
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await promoService.updateById(
    id as unknown as Types.ObjectId,
    req.body,
  );
  return res.status(200).json(createSuccessResponse(result));
};

export const list = async (req: Request, res: Response) => {
  const promos = await promoService.list({});

  return res.status(200).json(createSuccessResponse(promos));
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  await promoService.remove(id as unknown as Types.ObjectId);
  return res.status(200).json(createSuccessResponse({}));
};

export const apply = async (req: Request, res: Response) => {
  const { code, transactionAmount } = req.query;

  const promo = await promoService.apply(
    (code as string).toUpperCase(),
    Number(transactionAmount),
  );

  if (promo.fixedDiscount > 0)
    return res.status(200).json(
      createSuccessResponse({
        code: promo.code,
        discount: promo.fixedDiscount,
        paymentMethods: promo.acceptedPaymentMethods,
      }),
    );

  //respond with code, percentage discount, paymentMethods
  return res.status(200).json(
    createSuccessResponse({
      code: promo.code,
      discount: Number(transactionAmount) * promo.percentageDiscount * 0.01,
      paymentMethods: promo.acceptedPaymentMethods,
    }),
  );
};
