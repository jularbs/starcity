import slugify from 'slugify';
import { Request, Response } from 'express';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import { imageSliderService } from './imageSlider.service.js';
import { Types } from 'mongoose';
import { createSuccessResponse } from '../../common/utils/success-response.js';

export const create = async (req: Request, res: Response) => {
  const { order, name, startDate, endDate } = req.body;
  const imageFile = req.file as Express.Multer.File;

  const slug = slugify.default(name).toLowerCase();

  const imageSliderData = {
    order: parseInt(order, 10),
    name,
    slug,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    image: imageFile,
    status: false,
  };

  const result = await imageSliderService.create(imageSliderData);

  auditTrailService.create({
    action: 'Create new Image Slider Item',
    request: req,
    payload: { ...result, image: null },
  });

  res.status(201).json(createSuccessResponse(result));
};

export const read = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const is = await imageSliderService.getBySlug(slug as string);

  return res.status(200).json(createSuccessResponse(is));
};

export const list = async (req: Request, res: Response) => {
  const result = await imageSliderService.list();
  res.status(200).json(createSuccessResponse(result));
};

export const update = async (req: Request, res: Response) => {
  const { order, name, startDate, endDate, slug } = req.body;
  const { id } = req.params;
  const imageFile = req.file;

  const imageSliderData = {
    ...(order ? { order: parseInt(order, 10) } : {}),
    ...(name ? { name } : {}),
    ...(startDate ? { startDate: new Date(startDate) } : {}),
    ...(endDate ? { endDate: new Date(endDate) } : {}),
    ...(slug ? { slug: slugify.default(slug).toLowerCase() } : {}),
    ...(imageFile ? { image: imageFile } : {}),
  };

  const result = await imageSliderService.updateById(
    id as unknown as Types.ObjectId,
    imageSliderData,
  );

  auditTrailService.create({
    action: `Updated Image Slider Item ${id}`,
    payload: { ...result, image: null },
    request: req,
  });
  return res.status(200).json(createSuccessResponse(result));
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  await imageSliderService.deleteById(id as unknown as Types.ObjectId);

  auditTrailService.create({
    action: `Deleted Image Slider Item ${id}`,
    payload: {},
    request: req,
  });
  return res.status(200).json(createSuccessResponse({}));
};
