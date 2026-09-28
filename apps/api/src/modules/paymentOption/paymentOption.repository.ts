import PaymentOption from './paymentOption.model.js';
import type { Types } from 'mongoose';

type CreatePaymentOption = {
  name: string;
  slug: string;
  status: boolean;
  deletedAt: Date | null;
  meta: Record<string, any> | undefined;
};

const create = async (data: CreatePaymentOption) => {
  return PaymentOption.create(data);
};

const updateById = async (
  id: Types.ObjectId,
  data: Partial<CreatePaymentOption>,
) => {
  return PaymentOption.findByIdAndUpdate(id, data, { returnDocument: 'after' });
};

const findBySlug = async (slug: string) => {
  return PaymentOption.findOne({ slug, deletedAt: null });
};

const findById = async (id: Types.ObjectId) => {
  return PaymentOption.findById(id);
};

const list = async (filters: { status?: boolean }) => {
  const query: Record<string, any> = { deletedAt: null };
  if (filters.status !== undefined) {
    query.status = filters.status;
  }
  return PaymentOption.find(query);
};

export const paymentOptionRepository = {
  create,
  findBySlug,
  findById,
  updateById,
  list,
};
