import { optionRepository } from './option.repository.js';
import type { Types } from 'mongoose';

type CreateOptionInput = {
  name: string;
  slug: string;
  value: string;
  meta: Record<string, any> | undefined;
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
    throw new Error('Option not found');
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

const list = async () => {
  return optionRepository.list();
};

const deleteById = async (id: Types.ObjectId) => {
  const option = await optionRepository.findById(id);
  if (!option) {
    throw new Error('Option not found');
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
  list,
};
