import { promoRepository } from './promo.repository.js';
import type { Types } from 'mongoose';

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
  meta: Record<string, any> | undefined;
};

const create = async (data: CreatePromoInput) => {
  const existingPromo = await promoRepository.findByCode(data.code);
  if (existingPromo) {
    throw new Error(`Promo with code "${data.code}" already exists`);
  }

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
    throw new Error(`Promo with id "${id}" not found`);
  }

  return promoRepository.updateById(existingPromo._id, data);
};

const remove = async (id: Types.ObjectId) => {
  const promo = await promoRepository.findById(id);
  if (!promo) {
    throw new Error(`Promo with id "${id}" not found`);
  }

  if (promo.deletedAt) {
    throw new Error(`Promo with id "${id}" is already deleted`);
  }

  return promoRepository.updateById(id, { deletedAt: new Date() });
};

const toggleStatus = async (id: Types.ObjectId) => {
  const promo = await promoRepository.findById(id);
  if (!promo) {
    throw new Error(`Promo with id "${id}" not found`);
  }

  return promoRepository.updateById(id, { status: !promo.status });
};

const calculatePromoDiscount = async (
  code: string,
  transactionAmount: number,
): Promise<{ promoCode: Types.ObjectId | null; discount: number }> => {
  const promo = await promoRepository.findByCode(code);

  if (!promo) {
    throw new Error('Promo Code invalid or expired.');
  }

  if (promo.status === false) {
    throw new Error('Promo Code invalid or expired.');
  }

  if (promo.deletedAt) {
    throw new Error('Promo Code invalid or expired.');
  }

  if (transactionAmount < promo.minimumRequired) {
    throw new Error('Minimum required price not met.');
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
    throw new Error('Promo Code invalid or expired.');
  }

  if (promo.status === false) {
    throw new Error('Promo Code invalid or expired.');
  }

  if (promo.deletedAt) {
    throw new Error('Promo Code invalid or expired.');
  }

  if (promo.minimumRequired > 0 && transactionAmount < promo.minimumRequired) {
    throw new Error('Minimum required price not met.');
  }

  const now = new Date();
  if (now < promo.startDate || now > promo.endDate) {
    throw new Error('Promo Code invalid or expired.');
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
  toggleStatus,
  calculatePromoDiscount,
};
