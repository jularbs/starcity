import { rideService } from './ride.service.js';
import type { Types } from 'mongoose';
import type { Request, Response } from 'express';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import slugify from 'slugify';

export const create = async (req: Request, res: Response) => {
  const imageFile = req.file;
  const slug = slugify.default(req.body.name).toLowerCase();
  const result = await rideService.create({
    ...req.body,
    slug: slug,
    media: imageFile,
  });

  res.status(200).json({
    data: result,
    success: 'Ride added successfully',
  });
  auditTrailService.create({
    action: 'Create new ride',
    payload: { result },
    request: req,
  });
};

export const read = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const data = await rideService.getBySlug(slug as string);
  res.json(data);
};

export const list = async (req: Request, res: Response) => {
  const data = await rideService.list();
  res.json(data);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const imageFile = req.file;
  const result = await rideService.updateById(id as unknown as Types.ObjectId, {
    ...req.body,
    ...(imageFile && { media: imageFile }),
  });
  const r = await result.populate('rideCategoryId', 'name _id');
  auditTrailService.create({
    action: `Updated ride ${r.name}`,
    payload: {},
    request: req,
  });

  return res.json({
    result: r,
    success: 'Ride/Attraction updated successfully!',
  });
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  await rideService.removeById(id as unknown as Types.ObjectId);
  auditTrailService.create({
    action: `Deleted ride ${id}`,
    payload: { id },
    request: req,
  });

  //TODO: DELETE IMAGE
  return res.json({ success: 'Ride deleted successfully' });
};

export const readByRideCategoryId = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await rideService.getByRideCategoryId(
    id as unknown as Types.ObjectId,
  );
  res.json(data);
};
