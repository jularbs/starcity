import RideCategory from './rideCategory.model.js';
import { Types } from 'mongoose';
const create = async (data: {
  name: string;
  description: string;
  slug: string;
}) => {
  return RideCategory.create(data);
};

const findBySlug = async (slug: string) => {
  return RideCategory.findOne({ slug });
};

const findById = async (id: Types.ObjectId) => {
  return RideCategory.findById(id);
};

const list = async () => {
  return RideCategory.find();
};

const updateById = async (
  id: Types.ObjectId,
  data: {
    name?: string;
    description?: string;
    slug?: string;
  },
) => {
  return RideCategory.findByIdAndUpdate(id, data, { returnDocument: 'after' });
};

const removeById = async (id: Types.ObjectId) => {
  return RideCategory.findByIdAndDelete(id);
};

const count = async () => {
  return RideCategory.countDocuments();
};

export const rideCategoryRepository = {
  create,
  findBySlug,
  findById,
  list,
  updateById,
  removeById,
  count,
};
