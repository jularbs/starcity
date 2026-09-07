import { rideRepository } from './ride.repository.js';
import { Types } from 'mongoose';
export type CreateRideInput = {
  name: string;
  description: string;
  slug: string;
  status: string;
  heightRequirements: string;
  rideCategoryId: Types.ObjectId;
  media: {
    location: string;
    bucket: string;
    key: string;
  };
};
const getById = async (id: Types.ObjectId) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID');
  }

  const ride = await rideRepository.findById(id);

  if (!ride) {
    throw new Error('Ride not found');
  }

  return ride;
};

const list = async () => {
  const rides = await rideRepository.list();
  return rides;
};

const create = async (data: CreateRideInput) => {
  const ride = await rideRepository.create(data);
  return ride;
};

const updateById = async (
  id: Types.ObjectId,
  data: Partial<CreateRideInput>,
) => {
  const checkRide = await rideRepository.findById(id);
  if (!checkRide) {
    throw new Error('Ride not found');
  }

  const slugCheck = await rideRepository.findBySlug(data.slug);
  if (slugCheck && slugCheck._id.toString() !== id.toString()) {
    throw new Error('Slug already in use');
  }

  return await rideRepository.updateById(id, data);
};

const getBySlug = async (slug: string) => {
  const ride = await rideRepository.findBySlug(slug);

  if (!ride) {
    throw new Error('Ride not found');
  }

  return ride;
};

const getByRideCategoryId = async (rideCategoryId: Types.ObjectId) => {
  const rides = await rideRepository.findByRideCategoryId(rideCategoryId);
  return rides;
};

const removeById = async (id: Types.ObjectId) => {
  const checkRide = await rideRepository.findById(id);
  if (!checkRide) {
    throw new Error('Ride not found');
  }

  return await rideRepository.removeById(id);
};

export const rideService = {
  getById,
  getBySlug,
  getByRideCategoryId,
  create,
  list,
  updateById,
  removeById,
};
