import { promoService } from './promo.service.js';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

export const create = async (req: Request, res: Response) => {
  const result = await promoService.create(req.body);
  return res.json({
    success: 'Promo Code created successfully',
    data: result,
  });
};

export const read = async (req: Request, res: Response) => {
  const { id } = req.params;

  const promo = await promoService.getById(id as unknown as Types.ObjectId);
  return res.json(promo);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await promoService.updateById(
    id as unknown as Types.ObjectId,
    req.body,
  );
  return res.json({
    success: 'Promo Code updated successfully',
    data: result,
  });
};

export const list = async (req: Request, res: Response) => {
  const promos = await promoService.list({});

  return res.json(promos);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await promoService.remove(id as unknown as Types.ObjectId);
  return res.json({
    success: 'Promo Code removed successfully',
    data: result,
  });
};

export const apply = async (req: Request, res: Response) => {
  const { code, transactionAmount } = req.query;

  const promo = await promoService.apply(
    (code as string).toUpperCase(),
    Number(transactionAmount),
  );

  if (promo.fixedDiscount > 0)
    return res.json({
      code: promo.code,
      discount: promo.fixedDiscount,
      paymentMethods: promo.acceptedPaymentMethods,
    });

  //respond with code, percentage discount, paymentMethods
  return res.json({
    code: promo.code,
    discount: Number(transactionAmount) * promo.percentageDiscount * 0.01,
    paymentMethods: promo.acceptedPaymentMethods,
  });
};
