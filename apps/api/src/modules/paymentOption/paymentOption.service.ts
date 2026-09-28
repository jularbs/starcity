import { AppError } from '../../common/errors/app-error.js';
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
    throw new AppError({
      message: `Payment option with slug "${data.slug}" already exists`,
      code: 'PAYMENT_OPTION_ALREADY_EXISTS',
      statusCode: 400,
    });
  }

  return paymentOptionRepository.create(data);
};

const updateById = async (
  id: Types.ObjectId,
  data: Partial<CreatePaymentOption>,
) => {
  const existingPaymentOption = await paymentOptionRepository.findById(id);

  if (!existingPaymentOption) {
    throw new AppError({
      message: 'Payment Option not found',
      code: 'PAYMENT_OPTION_NOT_FOUND',
      statusCode: 404,
    });
  }

  return paymentOptionRepository.updateById(id, data);
};

const getBySlug = async (slug: string) => {
  return await paymentOptionRepository.findBySlug(slug);
};

const getBySlugOrThrow = async (slug: string) => {
  const paymentOption = await paymentOptionRepository.findBySlug(slug);
  if (!paymentOption) {
    throw new AppError({
      message: `Payment option with slug "${slug}" not found`,
      code: 'PAYMENT_OPTION_NOT_FOUND',
      statusCode: 404,
    });
  }
  return paymentOption;
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
    throw new AppError({
      message: `Payment option not found`,
      code: 'PAYMENT_OPTION_NOT_FOUND',
      statusCode: 404,
    });
  }

  return paymentOptionRepository.updateById(id, { deletedAt: new Date() });
};

export const paymentOptionService = {
  create,
  updateById,
  getBySlug,
  getBySlugOrThrow,
  getById,
  list,
  removeById,
};
