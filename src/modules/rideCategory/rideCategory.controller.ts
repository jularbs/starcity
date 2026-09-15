import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import { rideCategoryService } from './rideCategory.service.js';
import { createSuccessResponse } from '../../common/utils/success-response.js';
type RequestWithProfile = Request & { profile: { name: string } };

export const create = async (req: RequestWithProfile, res: Response) => {
  const { name, description } = req.body;

  const result = await rideCategoryService.create({ name, description });
  auditTrailService.create({
    action: `Created new Ride Category`,
    payload: result,
    request: req,
  });
  return res.status(200).json(createSuccessResponse(result));
};

export const read = async (req: Request, res: Response) => {
  const data = await rideCategoryService.getBySlug(req.params.slug as string);
  return res.status(200).json(createSuccessResponse(data));
};

export const list = async (_req: Request, res: Response) => {
  const data = await rideCategoryService.list();
  return res.status(200).json(createSuccessResponse(data));
};

export const update = async (req: RequestWithProfile, res: Response) => {
  const { id } = req.params;
  const { slug, name, description } = req.body;

  const updateData = { name, description, slug };

  const result = await rideCategoryService.updateById(
    id as unknown as Types.ObjectId,
    updateData,
  );
  auditTrailService.create({
    action: `Updated Ride Category ${name}`,
    payload: result,
    request: req,
  });
  return res.status(200).json(createSuccessResponse(result));
};

export const remove = async (req: RequestWithProfile, res: Response) => {
  const { id } = req.params;

  await rideCategoryService.removeById(id as unknown as Types.ObjectId);
  auditTrailService.create({
    action: `Deleted Ride Category`,
    payload: { id },
    request: req,
  });
  res.status(200).json(createSuccessResponse({}));
};
