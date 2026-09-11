import { AppError } from '../../common/errors/app-error.js';
import { uploadFile } from '../../common/object-storage/amazon-s3.js';
import { imageSliderRepository } from './imageSlider.repository.js';
import type { Types } from 'mongoose';
type CreateImageSliderInput = {
  order: number;
  name: string;
  slug: string;
  image: Express.Multer.File;
  startDate: Date;
  endDate: Date;
  status: boolean;
};

const create = async (data: CreateImageSliderInput) => {
  const imageSlider = await imageSliderRepository.findBySlug(data.slug);
  if (imageSlider) {
    throw new AppError({
      message: 'Image Slider item with this slug already exists',
      statusCode: 400,
      code: 'IMAGE_SLIDER_SLUG_EXISTS',
    });
  }

  const date = new Date();
  const month = date.getUTCMonth() + 1; //months from 1-12
  const year = date.getUTCFullYear();

  const imageInfo = await uploadFile(
    data.image,
    `image-slider/${year}/${month}/${data.slug}`,
  );

  return imageSliderRepository.create({ ...data, image: imageInfo });
};

const updateById = async (
  id: Types.ObjectId,
  data: Partial<CreateImageSliderInput>,
) => {
  const imageSlider = await imageSliderService.getById(id);

  if (!imageSlider) {
    throw new AppError({
      message: 'Image Slider item not found',
      statusCode: 404,
      code: 'IMAGE_SLIDER_NOT_FOUND',
    });
  }
  const { image, ...restData } = data;

  let imageInfo: { location: string; bucket: string; key: string };
  if (image) {
    const date = new Date();
    const month = date.getUTCMonth() + 1; //months from 1-12
    const year = date.getUTCFullYear();

    imageInfo = await uploadFile(
      image,
      `image-slider/${year}/${month}/${imageSlider.slug}`,
    );
    //TODOS: if overwritten, delete the old image from storage
  }

  return imageSliderRepository.updateById(id, {
    ...restData,
    ...(imageInfo ? { image: imageInfo } : {}),
  });
};

const getBySlug = async (slug: string) => {
  const imageSlider = await imageSliderRepository.findBySlug(slug);

  if (!imageSlider) {
    throw new AppError({
      message: 'Image Slider item not found',
      statusCode: 404,
      code: 'IMAGE_SLIDER_NOT_FOUND',
    });
  }
  return imageSlider;
};

const getById = async (id: Types.ObjectId) => {
  return imageSliderRepository.findById(id);
};

const list = async () => {
  return imageSliderRepository.list();
};

const deleteById = async (id: Types.ObjectId) => {
  const imageSlider = await imageSliderService.getById(id);

  if (!imageSlider) {
    throw new AppError({
      message: 'Image Slider item not found',
      statusCode: 404,
      code: 'IMAGE_SLIDER_NOT_FOUND',
    });
  }

  //TODOS: delete associated image from storage if necessary
  return imageSliderRepository.deleteById(id);
};

export const imageSliderService = {
  create,
  updateById,
  getBySlug,
  getById,
  deleteById,
  list,
};
