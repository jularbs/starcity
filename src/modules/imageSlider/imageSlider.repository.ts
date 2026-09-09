import ImageSlider from './imageSlider.model.js';
import type { Types } from 'mongoose';

type CreateImageSlider = {
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

const create = async (data: CreateImageSlider) => {
  return ImageSlider.create(data);
};

const updateById = async (
  id: Types.ObjectId,
  data: Partial<CreateImageSlider>,
) => {
  return ImageSlider.findByIdAndUpdate(id, data, { returnDocument: 'after' });
};

const findBySlug = async (slug: string) => {
  return ImageSlider.findOne({ slug });
};

const findById = async (id: Types.ObjectId) => {
  return ImageSlider.findById(id);
};

const list = async () => {
  return ImageSlider.find({}).sort({ order: 1 });
};

const deleteById = async (id: Types.ObjectId) => {
  return ImageSlider.findByIdAndDelete(id);
};

export const imageSliderRepository = {
  create,
  findBySlug,
  updateById,
  findById,
  deleteById,
  list,
};
