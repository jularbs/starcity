import { AppError } from '../../common/errors/app-error.js';
import { optionRepository } from './option.repository.js';
import type { Types } from 'mongoose';

type CreateOptionInput = {
  name: string;
  slug: string;
  value: string | null;
};

type ListOptionInput = {
  skip: number;
  limit: number;
};

const create = async (data: CreateOptionInput) => {
  return optionRepository.create(data);
};

const updateById = async (
  id: Types.ObjectId,
  data: Partial<CreateOptionInput>,
) => {
  const option = await optionRepository.findById(id);
  if (!option) {
    throw new AppError({
      message: 'Option not found',
      code: 'OPTION_NOT_FOUND',
      statusCode: 404,
    });
  }

  return optionRepository.updateById(id, data);
};

const getByName = async (name: string) => {
  return optionRepository.findByName(name);
};

const getById = async (id: Types.ObjectId) => {
  return optionRepository.findById(id);
};

const getBySlug = async (slug: string) => {
  return optionRepository.findBySlug(slug);
};

const getBySlugOrThrow = async (slug: string) => {
  const option = await optionRepository.findBySlug(slug);
  if (!option) {
    throw new AppError({
      message: 'Option not found',
      code: 'OPTION_NOT_FOUND',
      statusCode: 404,
    });
  }
  return option;
};

const list = async (params: ListOptionInput) => {
  return optionRepository.list(params);
};

const deleteById = async (id: Types.ObjectId) => {
  const option = await optionRepository.findById(id);
  if (!option) {
    throw new AppError({
      message: 'Option not found',
      code: 'OPTION_NOT_FOUND',
      statusCode: 404,
    });
  }

  return optionRepository.deleteById(id);
};

export const optionService = {
  create,
  updateById,
  getByName,
  getById,
  deleteById,
  getBySlug,
  getBySlugOrThrow,
  list,
};
