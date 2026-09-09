import { paymentOptionRepository } from './paymentOption.repository.js';
import type { Types } from 'mongoose';

type CreatePaymentOption = {
  name: string;
  slug: string;
  status: boolean;
  deletedAt: Date | null;
  meta: Record<string, any> | undefined;
};
const create = async (data: CreatePaymentOption) => {
  const existingPaymentOption = await paymentOptionRepository.findBySlug(
    data.slug,
  );
  if (existingPaymentOption) {
    throw new Error(`Payment option with slug "${data.slug}" already exists`);
  }

  return paymentOptionRepository.create(data);
};

const updateById = async (
  id: Types.ObjectId,
  data: Partial<CreatePaymentOption>,
) => {
  const existingPaymentOption = await paymentOptionRepository.findById(id);

  if (!existingPaymentOption) {
    throw new Error(`Payment option not found`);
  }

  return paymentOptionRepository.updateById(id, data);
};

const getBySlug = async (slug: string) => {
  return await paymentOptionRepository.findBySlug(slug);
};

const getById = async (id: Types.ObjectId) => {
  return await paymentOptionRepository.findById(id);
};

const list = async (filters: { status?: boolean }) => {
  return await paymentOptionRepository.list(filters);
};

const removeById = async (id: Types.ObjectId) => {
  const existingPaymentOption = await paymentOptionRepository.findById(id);

  if (!existingPaymentOption) {
    throw new Error(`Payment option not found`);
  }

  return paymentOptionRepository.updateById(id, { deletedAt: new Date() });
};

const toggleStatusById = async (id: Types.ObjectId) => {
  const existingPaymentOption = await paymentOptionRepository.findById(id);

  if (!existingPaymentOption) {
    throw new Error(`Payment option not found`);
  }

  return paymentOptionRepository.updateById(id, {
    status: !existingPaymentOption.status,
  });
};

export const paymentOptionService = {
  create,
  updateById,
  getBySlug,
  getById,
  list,
  removeById,
  toggleStatusById,
};
