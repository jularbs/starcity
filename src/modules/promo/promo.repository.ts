import Promo from './promo.model.js';
import type { Types } from 'mongoose';

type CreatePromo = {
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

const create = async (data: CreatePromo) => {
  return Promo.create(data);
};

const updateById = async (id: Types.ObjectId, data: Partial<CreatePromo>) => {
  return Promo.findByIdAndUpdate(id, data, { returnDocument: 'after' });
};

const findByCode = async (code: string) => {
  return Promo.findOne({ code, deletedAt: null });
};

const findById = async (id: Types.ObjectId) => {
  return Promo.findById(id);
};

const list = async (filters: { status?: boolean }) => {
  const query: Record<string, any> = { deletedAt: null };
  if (filters.status !== undefined) {
    query.status = filters.status;
  }
  return Promo.find(query);
};

export const promoRepository = {
  create,
  findByCode,
  findById,
  updateById,
  list,
};
