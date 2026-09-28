import { promoRepository } from './promo.repository.js';
import { paymentOptionService } from '../paymentOption/paymentOption.service.js';
import type { Types } from 'mongoose';
import { AppError } from '../../common/errors/app-error.js';

type CreatePromoInput = {
  code: string;
  campaignName: string;
  startDate: Date;
  endDate: Date;
  percentageDiscount: number;
  fixedDiscount: number;
  maxDiscount: number;
  minimumRequired: number;
  acceptedPaymentMethods: Types.ObjectId[];
  maxUsage: number;
  status: boolean;
  deletedAt: Date | null;
};

const create = async (data: CreatePromoInput) => {
  const existingPromo = await promoRepository.findByCode(data.code);
  if (existingPromo) {
    throw new AppError({
      message: `Promo with code ${data.code} already exists`,
      code: 'PROMO_CODE_EXISTS',
      statusCode: 400,
    });
  }

  await Promise.all(
    data.acceptedPaymentMethods.map(async (method) => {
      const paymentMethod = await paymentOptionService.getById(method);
      if (!paymentMethod) {
        throw new AppError({
          message: `Payment method with id ${method} does not exist`,
          code: 'INVALID_PAYMENT_METHOD',
          statusCode: 400,
        });
      }
    }),
  );

  return promoRepository.create(data);
};

const getById = async (id: Types.ObjectId) => {
  return promoRepository.findById(id);
};

const getByCode = async (code: string) => {
  return promoRepository.findByCode(code);
};

const list = async (filter: { status?: boolean }) => {
  return promoRepository.list(filter);
};

const updateById = async (
  id: Types.ObjectId,
  data: Partial<CreatePromoInput>,
) => {
  const existingPromo = await promoRepository.findById(id);
  if (!existingPromo) {
    throw new AppError({
      message: 'Promo not found',
      code: 'PROMO_NOT_FOUND',
      statusCode: 404,
    });
  }

  if (data.startDate && data.endDate && data.startDate >= data.endDate) {
    throw new AppError({
      message: 'Start date must be before end date',
      code: 'INVALID_DATE_RANGE',
      statusCode: 400,
    });
  }

  if (
    data.endDate &&
    !data.startDate &&
    existingPromo.startDate >= data.endDate
  ) {
    throw new AppError({
      message: 'Start date must be before end date',
      code: 'INVALID_DATE_RANGE',
      statusCode: 400,
    });
  }

  if (
    data.startDate &&
    !data.endDate &&
    existingPromo.endDate &&
    data.startDate >= existingPromo.endDate
  ) {
    throw new AppError({
      message: 'Start date must be before end date',
      code: 'INVALID_DATE_RANGE',
      statusCode: 400,
    });
  }

  return promoRepository.updateById(existingPromo._id, data);
};

const remove = async (id: Types.ObjectId) => {
  const promo = await promoRepository.findById(id);
  if (!promo) {
    throw new AppError({
      message: 'Promo not found',
      code: 'PROMO_NOT_FOUND',
      statusCode: 404,
    });
  }

  if (promo.deletedAt) {
    throw new AppError({
      message: 'Promo is already deleted',
      code: 'PROMO_ALREADY_DELETED',
      statusCode: 400,
    });
  }

  return promoRepository.updateById(id, { deletedAt: new Date() });
};

const calculatePromoDiscount = async (
  code: string,
  transactionAmount: number,
): Promise<{ promoCode: Types.ObjectId | null; discount: number }> => {
  const promo = await promoRepository.findByCode(code);

  if (!promo) {
    throw new AppError({
      message: 'Promo Code invalid or expired.',
      code: 'PROMO_INVALID_OR_EXPIRED',
      statusCode: 400,
    });
  }

  if (promo.status === false) {
    throw new AppError({
      message: 'Promo Code invalid or expired.',
      code: 'PROMO_INVALID_OR_EXPIRED',
      statusCode: 400,
    });
  }

  if (promo.deletedAt) {
    throw new AppError({
      message: 'Promo Code invalid or expired.',
      code: 'PROMO_INVALID_OR_EXPIRED',
      statusCode: 400,
    });
  }

  if (transactionAmount < promo.minimumRequired) {
    throw new AppError({
      message: 'Minimum required price not met.',
      code: 'MINIMUM_REQUIRED_NOT_MET',
      statusCode: 400,
    });
  }

  //TODOS: Add validation for maxUsage

  if (promo.fixedDiscount > 0) {
    return { promoCode: promo._id, discount: promo.fixedDiscount };
  }

  return {
    promoCode: promo._id,
    discount: transactionAmount * promo.percentageDiscount * 0.01,
  };
};

const apply = async (code: string, transactionAmount: number) => {
  const promo = await promoRepository.findByCode(code);

  if (!promo) {
    throw new AppError({
      message: 'Promo Code invalid or expired.',
      code: 'PROMO_INVALID_OR_EXPIRED',
      statusCode: 400,
    });
  }

  if (promo.status === false) {
    throw new AppError({
      message: 'Promo Code invalid or expired.',
      code: 'PROMO_INVALID_OR_EXPIRED',
      statusCode: 400,
    });
  }

  if (promo.deletedAt) {
    throw new AppError({
      message: 'Promo Code invalid or expired.',
      code: 'PROMO_INVALID_OR_EXPIRED',
      statusCode: 400,
    });
  }

  if (promo.minimumRequired > 0 && transactionAmount < promo.minimumRequired) {
    throw new AppError({
      message: 'Minimum required price not met.',
      code: 'MINIMUM_REQUIRED_NOT_MET',
      statusCode: 400,
    });
  }

  const now = new Date();
  if (now < promo.startDate || now > promo.endDate) {
    throw new AppError({
      message: 'Promo Code invalid or expired.',
      code: 'PROMO_INVALID_OR_EXPIRED',
      statusCode: 400,
    });
  }

  return promo;
};

export const promoService = {
  apply,
  create,
  getById,
  getByCode,
  updateById,
  list,
  remove,
  calculatePromoDiscount,
};
