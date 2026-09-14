//TODOS: Handle duplicate errors
import Promo from './promo.model.js';
import { promoService } from './promo.service.js';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

const firstValue = <T>(value: T | T[]) =>
  Array.isArray(value) ? value[0] : value;

const parseBoolean = (value: unknown) =>
  typeof value === 'boolean' ? value : value === 'true';

const parsePaymentOptions = (value: unknown) => {
  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return value ?? [];
};

const buildPromoData = (fields: Record<string, any>) => ({
  code: firstValue(fields.code).toUpperCase(),
  campaignName: firstValue(fields.campaignName),
  startDate: new Date(firstValue(fields.startDate)),
  endDate: new Date(firstValue(fields.endDate)),
  percentageDiscount: Number(firstValue(fields.percentageDiscount)),
  fixedDiscount: Number(firstValue(fields.fixedDiscount)),
  maxDiscount: Number(firstValue(fields.maxDiscount)),
  minimumRequired: Number(firstValue(fields.minimumRequired)),
  maxUsage: Number(firstValue(fields.maxUsage)),
  status: parseBoolean(firstValue(fields.status)),
  acceptedPaymentMethods: parsePaymentOptions(fields.paymentOptions),
  deletedAt: null,
});

export const create = async (req: Request, res: Response) => {
  const {
    code,
    campaignName,
    startDate,
    endDate,
    percentageDiscount,
    fixedDiscount,
    maxDiscount,
    minimumRequired,
    maxUsage,
    status,
    paymentOptions,
  } = req.body;

  const promoData = buildPromoData({
    code,
    campaignName,
    startDate,
    endDate,
    percentageDiscount,
    fixedDiscount,
    maxDiscount,
    minimumRequired,
    maxUsage,
    status,
    paymentOptions,
  });

  try {
    const result = await promoService.create(promoData);
    return res.json({
      success: 'Promo Code created successfully',
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: 'Failed to add promo. Please try again later.',
    });
  }
};

export const read = async (req: Request, res: Response) => {
  const { id } = req.params;

  const promo = await Promo.findOne({ _id: id }).exec();
  return res.json(promo);
};

export const update = async (req: Request, res: Response) => {
  const {
    _id,
    code,
    campaignName,
    startDate,
    endDate,
    percentageDiscount,
    fixedDiscount,
    maxDiscount,
    minimumRequired,
    maxUsage,
    status,
    paymentOptions,
  } = req.body;

  const updateData = buildPromoData({
    code,
    campaignName,
    startDate,
    endDate,
    percentageDiscount,
    fixedDiscount,
    maxDiscount,
    minimumRequired,
    maxUsage,
    status,
    paymentOptions,
  });

  try {
    const result = await promoService.updateById(
      _id as unknown as Types.ObjectId,
      updateData,
    );
    return res.json({
      success: 'Promo Code updated successfully',
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: 'Failed to update promo. Please try again later.',
    });
  }
};

export const list = async (req: Request, res: Response) => {
  const promos = await promoService.list({});

  return res.json(promos);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await promoService.remove(id as unknown as Types.ObjectId);
    return res.json({
      success: 'Promo Code removed successfully',
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: 'Failed to remove promo. Please try again later.',
    });
  }
};

export const apply = async (req: Request, res: Response) => {
  const { code, transactionAmount } = req.query;

  if (typeof code !== 'string')
    return res.status(400).json({
      error: 'Promo Code invalid or expired.',
    });

  const promo = await promoService.apply(
    code.toUpperCase(),
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

export const toggle = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const result = await promoService.toggleStatus(
      id as unknown as Types.ObjectId,
    );
    return res.json({
      success: 'Promo toggled successfully',
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: 'Failed to toggle promo. Please try again later.',
    });
  }
};
