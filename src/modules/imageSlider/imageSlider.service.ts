import { imageSliderRepository } from './imageSlider.repository.js';
import type { Types } from 'mongoose';
type CreateImageSliderInput = {
  order: number;
  name: string;
  slug: string;
  image: {
    location: string;
    bucket: string;
    key: string;
  };
  startDate: Date;
  endDate: Date;
  status: boolean;
};

const create = async (data: CreateImageSliderInput) => {
  return imageSliderRepository.create(data);
};

const updateById = async (
  id: Types.ObjectId,
  data: Partial<CreateImageSliderInput>,
) => {
  return imageSliderRepository.updateById(id, data);
};

const getBySlug = async (slug: string) => {
  return imageSliderRepository.findBySlug(slug);
};

const getById = async (id: Types.ObjectId) => {
  return imageSliderRepository.findById(id);
};

const list = async () => {
  return imageSliderRepository.list();
};

const deleteById = async (id: Types.ObjectId) => {
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
