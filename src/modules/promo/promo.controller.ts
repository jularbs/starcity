//TODOS: Handle duplicate errors
import Promo from './promo.model.js';
import { promoService } from './promo.service.js';
import formidable from 'formidable';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

export const create = async (req: Request, res: Response) => {
  const form = formidable();
  form.parse(req, async (err, fields) => {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .json({ error: 'Error on parsing form. Please try again later.' });
    }

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
    } = fields;

    const promoData = {
      code: Array.isArray(code) ? code[0].toUpperCase() : code.toUpperCase(),
      campaignName: Array.isArray(campaignName)
        ? campaignName[0]
        : campaignName,
      startDate: Array.isArray(startDate)
        ? new Date(startDate[0])
        : new Date(startDate),
      endDate: Array.isArray(endDate)
        ? new Date(endDate[0])
        : new Date(endDate),
      percentageDiscount: Array.isArray(percentageDiscount)
        ? Number(percentageDiscount[0])
        : Number(percentageDiscount),
      fixedDiscount: Array.isArray(fixedDiscount)
        ? Number(fixedDiscount[0])
        : Number(fixedDiscount),
      maxDiscount: Array.isArray(maxDiscount)
        ? Number(maxDiscount[0])
        : Number(maxDiscount),
      minimumRequired: Array.isArray(minimumRequired)
        ? Number(minimumRequired[0])
        : Number(minimumRequired),
      maxUsage: Array.isArray(maxUsage)
        ? Number(maxUsage[0])
        : Number(maxUsage),
      status: Array.isArray(status)
        ? status[0] === 'true'
          ? true
          : false
        : status === 'true'
          ? true
          : false,
      acceptedPaymentMethods: Array.isArray(paymentOptions)
        ? JSON.parse(paymentOptions[0])
        : paymentOptions
          ? JSON.parse(paymentOptions)
          : [],
      deletedAt: null,
      meta: undefined,
    };

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
  });
};

export const read = async (req: Request, res: Response) => {
  const { id } = req.params;

  const promo = await Promo.findOne({ _id: id }).exec();
  return res.json(promo);
};

export const update = async (req: Request, res: Response) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields) => {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .json({ error: 'Error on parsing form. Please try again later.' });
    }

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
    } = fields;

    const updateData = {
      code: Array.isArray(code) ? code[0].toUpperCase() : code.toUpperCase(),
      campaignName: Array.isArray(campaignName)
        ? campaignName[0]
        : campaignName,
      startDate: Array.isArray(startDate)
        ? new Date(startDate[0])
        : new Date(startDate),
      endDate: Array.isArray(endDate)
        ? new Date(endDate[0])
        : new Date(endDate),
      percentageDiscount: Array.isArray(percentageDiscount)
        ? Number(percentageDiscount[0])
        : Number(percentageDiscount),
      fixedDiscount: Array.isArray(fixedDiscount)
        ? Number(fixedDiscount[0])
        : Number(fixedDiscount),
      maxDiscount: Array.isArray(maxDiscount)
        ? Number(maxDiscount[0])
        : Number(maxDiscount),
      minimumRequired: Array.isArray(minimumRequired)
        ? Number(minimumRequired[0])
        : Number(minimumRequired),
      maxUsage: Array.isArray(maxUsage)
        ? Number(maxUsage[0])
        : Number(maxUsage),
      status: Array.isArray(status)
        ? status[0] === 'true'
          ? true
          : false
        : status === 'true'
          ? true
          : false,
      acceptedPaymentMethods: Array.isArray(paymentOptions)
        ? JSON.parse(paymentOptions[0])
        : paymentOptions
          ? JSON.parse(paymentOptions)
          : [],
      deletedAt: null,
      meta: undefined,
    };

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
  });
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
