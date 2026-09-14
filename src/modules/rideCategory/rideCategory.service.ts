import slugify from 'slugify';
import { rideCategoryRepository } from './rideCategory.repository.js';
import { Types } from 'mongoose';
import { rideService } from '../ride/ride.service.js';
import { AppError } from '../../common/errors/app-error.js';

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
  if (data.slug) {
    const checkSlug = await rideCategoryService.getBySlug(data.slug);
    if (checkSlug && checkSlug._id.toString() !== id.toString()) {
      throw new AppError({
        message: 'Ride Category with this slug already exists',
        code: 'RIDE_CATEGORY_SLUG_EXISTS',
        statusCode: 400,
      });
    }
  }

  return rideCategoryRepository.updateById(id, data);
};

const removeById = async (id: Types.ObjectId) => {
  const rideCategory = await rideCategoryRepository.findById(id);

  if (!rideCategory) {
    throw new AppError({
      message: 'Ride Category not found',
      code: 'RIDE_CATEGORY_NOT_FOUND',
      statusCode: 404,
    });
  }

  const referencedRides = await rideService.getByRideCategoryId(
    rideCategory._id,
  );

  if (referencedRides.length > 0) {
    throw new AppError({
      message: 'Cannot delete ride category with referenced rides',
      code: 'RIDE_CATEGORY_REFERENCED',
      statusCode: 400,
    });
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
