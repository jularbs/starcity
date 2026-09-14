import { AppError } from '../../common/errors/app-error.js';
import { uploadFile } from '../../common/object-storage/amazon-s3.js';
import { rideRepository } from './ride.repository.js';
import { rideCategoryService } from '../rideCategory/rideCategory.service.js';
import { Types } from 'mongoose';
export type CreateRideInput = {
  name: string;
  description: string;
  slug: string;
  status: string;
  heightRequirements: string;
  rideCategoryId: Types.ObjectId;
  media: Express.Multer.File;
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
  const existingSlug = await rideRepository.findBySlug(data.slug);
  if (existingSlug) {
    throw new AppError({
      message: 'Slug already in use',
      code: 'RIDE_SLUG_EXISTS',
      statusCode: 400,
    });
  }

  const rideCategory = await rideCategoryService.getById(data.rideCategoryId);
  if (!rideCategory) {
    throw new AppError({
      message: 'Ride category not found',
      code: 'RIDE_CATEGORY_NOT_FOUND',
      statusCode: 400,
    });
  }

  const date = new Date();
  const month = date.getUTCMonth() + 1; //months from 1-12
  const year = date.getUTCFullYear();

  const imageInfo = await uploadFile(
    data.media,
    `ride/${year}/${month}/${data.slug}`,
  );

  const ride = await rideRepository.create({ ...data, media: imageInfo });
  return ride.populate('rideCategoryId', 'name');
};

const updateById = async (
  id: Types.ObjectId,
  data: Partial<CreateRideInput>,
) => {
  const checkRide = await rideRepository.findById(id);
  if (!checkRide) {
    throw new AppError({
      message: 'Ride not found',
      code: 'RIDE_NOT_FOUND',
      statusCode: 404,
    });
  }

  if (data.slug) {
    const slugCheck = await rideRepository.findBySlug(data.slug);
    if (slugCheck && slugCheck._id.toString() !== id.toString()) {
      throw new AppError({
        message: 'Slug already in use',
        code: 'RIDE_SLUG_EXISTS',
        statusCode: 400,
      });
    }
  }

  if (data.rideCategoryId) {
    const rideCategory = await rideCategoryService.getById(data.rideCategoryId);
    if (!rideCategory) {
      throw new AppError({
        message: 'Ride category not found',
        code: 'RIDE_CATEGORY_NOT_FOUND',
        statusCode: 400,
      });
    }
  }

  const { media, ...restData } = data;

  let imageInfo: { location: string; bucket: string; key: string };
  if (media) {
    const date = new Date();
    const month = date.getUTCMonth() + 1; //months from 1-12
    const year = date.getUTCFullYear();

    imageInfo = await uploadFile(
      media,
      `ride/${year}/${month}/${data.slug ? data.slug : checkRide.slug}`,
    );
    //TODOS: if overwritten, delete the old image from storage
  }

  return await rideRepository.updateById(id, {
    ...restData,
    ...(imageInfo && { media: imageInfo }),
  });
};

const getBySlug = async (slug: string) => {
  const ride = await rideRepository.findBySlug(slug);

  if (!ride) {
    throw new AppError({
      message: 'Ride not found',
      code: 'RIDE_NOT_FOUND',
      statusCode: 404,
    });
  }

  return ride;
};

const getByRideCategoryId = async (rideCategoryId: Types.ObjectId) => {
  const rideCategory = await rideCategoryService.getById(rideCategoryId);
  if (!rideCategory) {
    throw new AppError({
      message: 'Ride category not found',
      code: 'RIDE_CATEGORY_NOT_FOUND',
      statusCode: 404,
    });
  }

  const rides = await rideRepository.findByRideCategoryId(rideCategoryId);
  return rides;
};

const removeById = async (id: Types.ObjectId) => {
  const checkRide = await rideRepository.findById(id);
  if (!checkRide) {
    throw new AppError({
      message: 'Ride not found',
      code: 'RIDE_NOT_FOUND',
      statusCode: 404,
    });
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
