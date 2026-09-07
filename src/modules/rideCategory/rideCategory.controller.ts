import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import { createEntry } from '../auditTrail/auditTrail.controller.js';
import { rideCategoryService } from './rideCategory.service.js';
type RequestWithProfile = Request & { profile: { name: string } };

export const create = async (req: RequestWithProfile, res: Response) => {
  const { name, description } = req.body;

  const result = await rideCategoryService.create({ name, description });
  createEntry(req.profile.name, `Created new Ride Category`, result, req);
  return res.json({
    data: result,
    success: 'Ride Category added successfully!',
  });
};

export const read = async (req: Request, res: Response) => {
  const data = await rideCategoryService.getBySlug(req.params.slug as string);
  return res.json(data);
};

export const list = async (_req: Request, res: Response) => {
  const data = await rideCategoryService.list();
  return res.json(data);
};

export const update = async (req: RequestWithProfile, res: Response) => {
  const { id } = req.params;
  const { slug, name, description } = req.body;

  const checkSlug = await rideCategoryService.getBySlug(slug);
  if (checkSlug && checkSlug._id.toString() !== id) {
    return res.status(400).json({
      error: 'Slug already exists',
    });
  }

  const updateData = { name, description, slug };

  const result = await rideCategoryService.updateById(
    id as unknown as Types.ObjectId,
    updateData,
  );
  createEntry(req.profile.name, `Updated Ride Category ${name}`, result, req);
  return res.json({ result, status: 'success' });
};

export const remove = async (req: RequestWithProfile, res: Response) => {
  const { id } = req.params;

  await rideCategoryService.removeById(id as unknown as Types.ObjectId);
  createEntry(req.profile.name, `Deleted Ride Category`, { id }, req);
  res.json({ success: 'Ride Category deleted successfully' });
};
