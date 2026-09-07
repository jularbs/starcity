import Ride, { CreateRide } from './ride.model.js';
import { Types } from 'mongoose';

const create = async (data: CreateRide) => {
  return Ride.create(data);
};

const updateById = async (id: Types.ObjectId, data: Partial<CreateRide>) => {
  return Ride.findByIdAndUpdate(id, data, { returnDocument: 'after' });
};

const findById = async (id: Types.ObjectId) => {
  return Ride.findById(id);
};

const findBySlug = async (slug: string) => {
  return Ride.findOne({ slug })
    .select('name description slug status heightRequirements media')
    .populate('rideCategoryId', 'name');
};

const list = async () => {
  return Ride.find().populate('rideCategoryId', 'name');
};

const findByRideCategoryId = async (rideCategoryId: Types.ObjectId) => {
  return Ride.find({ rideCategoryId });
};

const removeById = async (id: Types.ObjectId) => {
  return Ride.findByIdAndDelete(id);
};

export const rideRepository = {
  create,
  findById,
  findBySlug,
  findByRideCategoryId,
  list,
  updateById,
  removeById,
};
