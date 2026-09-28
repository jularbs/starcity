import Option from './option.model.js';
import type { Types } from 'mongoose';

type CreateOption = {
  name: string;
  slug: string;
  value: string;
};

type ListOption = {
  skip: number;
  limit: number;
};
const findByName = async (name: string) => {
  return Option.findOne({ name });
};

const create = async (data: CreateOption) => {
  return Option.create(data);
};

const updateById = async (id: Types.ObjectId, data: Partial<CreateOption>) => {
  return Option.findByIdAndUpdate(id, data, { returnDocument: 'after' });
};

const findById = async (id: Types.ObjectId) => {
  return Option.findById(id);
};

const findBySlug = async (slug: string) => {
  return Option.findOne({ slug: slug });
};

const list = async (params: ListOption) => {
  const { skip, limit } = params;
  return Option.find({}).skip(skip).limit(limit);
};

const deleteById = async (id: Types.ObjectId) => {
  return Option.findByIdAndDelete(id);
};

export const optionRepository = {
  findByName,
  create,
  updateById,
  findById,
  deleteById,
  list,
  findBySlug,
};
