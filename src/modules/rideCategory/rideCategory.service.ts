import slugify from 'slugify';
import { rideCategoryRepository } from './rideCategory.repository.js';
import { Types } from 'mongoose';
import { rideService } from '../ride/ride.service.js';

const create = async (data: { name: string; description: string }) => {
  const slug = slugify.default(data.name).toLowerCase();
  if (!slug) {
    throw new Error('Failed to generate slug');
  }

  if (await rideCategoryRepository.findBySlug(slug)) {
    throw new Error('Slug already exists');
  }

  return rideCategoryRepository.create({ ...data, slug });
};

const getBySlug = async (slug: string) => {
  return rideCategoryRepository.findBySlug(slug);
};

const getById = async (id: Types.ObjectId) => {
  return rideCategoryRepository.findById(id);
};

const list = async () => {
  return rideCategoryRepository.list();
};

const updateById = async (
  id: Types.ObjectId,
  data: { name?: string; description?: string; slug?: string },
) => {
  return rideCategoryRepository.updateById(id, data);
};

const removeById = async (id: Types.ObjectId) => {
  const rideCategory = await rideCategoryRepository.findById(id);

  if (!rideCategory) {
    throw new Error('Ride Category not found');
  }

  const referencedRides = await rideService.getByRideCategoryId(
    rideCategory._id,
  );

  if (referencedRides.length > 0) {
    throw new Error('Cannot delete ride category with referenced rides');
  }

  return rideCategoryRepository.removeById(id);
};

export const rideCategoryService = {
  create,
  getBySlug,
  getById,
  list,
  updateById,
  removeById,
};
