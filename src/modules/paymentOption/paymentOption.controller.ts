import slugify from 'slugify';
import { paymentOptionService } from './paymentOption.service.js';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import type { Request, Response } from 'express';
import type { Types } from 'mongoose';

export const create = async (req: Request, res: Response) => {
  const { name } = req.body;
  const slug = slugify.default(name).toLowerCase();

  const result = await paymentOptionService.create({
    name,
    slug,
    status: false,
    deletedAt: null,
    meta: {},
  });
  auditTrailService.create({
    action: 'Created New Payment Option',
    payload: { name: name },
    request: req,
  });
  return res.json(result);
};

export const read = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const data = await paymentOptionService.getBySlugOrThrow(slug as string);

  return res.json(data);
};

export const publicList = async (req: Request, res: Response) => {
  const data = await paymentOptionService.list({ status: true });
  res.json(data);
};

export const manageList = async (req: Request, res: Response) => {
  const data = await paymentOptionService.list({});
  res.json(data);
};

export const update = async (req: Request, res: Response) => {
  const { slug, name, status } = req.body;
  const { id } = req.params;

  const result = await paymentOptionService.updateById(
    id as unknown as Types.ObjectId,
    {
      name,
      slug,
      status,
    },
  );

  auditTrailService.create({
    action: `Updated Payment Option ${slug}`,
    payload: { name: name },
    request: req,
  });
  res.json({ result, status: 'success' });
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  await paymentOptionService.removeById(id as unknown as Types.ObjectId);
  res.json({ success: 'Payment Option deleted successfully' });
  auditTrailService.create({
    action: `Deleted Payment Option ${id}`,
    payload: {},
    request: req,
  });
};
