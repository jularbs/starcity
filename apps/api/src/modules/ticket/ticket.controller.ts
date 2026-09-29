import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../common/utils/success-response.js';
import slugify from 'slugify';
import type { Types } from 'mongoose';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import { ticketService } from './ticket.service.js';

export const create = async (req: Request, res: Response) => {
  const { name, code, shortDescription, price, details } = req.body;

  const slug = slugify.default(name).toLowerCase();

  const ticketData = {
    name,
    slug,
    itemCode: code,
    shortDescription,
    price,
    details,
    status: false,
    meta: undefined,
  };

  const result = await ticketService.create(ticketData);
  auditTrailService.create({
    action: `Created New Ticket ${name}`,
    payload: result,
    request: req,
  });
  return res.status(200).json(createSuccessResponse(result));
};

export const read = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const data = await ticketService.getBySlugOrThrow(slug as string);

  res.status(200).json(createSuccessResponse(data));
};

export const publicList = async (req: Request, res: Response) => {
  const data = await ticketService.list({ status: true });
  res.status(200).json(createSuccessResponse(data));
};

export const manageList = async (req: Request, res: Response) => {
  const data = await ticketService.list({});
  res.status(200).json(createSuccessResponse(data));
};

export const update = async (req: Request, res: Response) => {
  const { name, slug, status, shortDescription, price, details, code } =
    req.body;
  const { id } = req.params;

  const updatedData = {
    name,
    slug,
    status,
    itemCode: code,
    shortDescription,
    price,
    details,
  };

  const result = await ticketService.updateById(
    id as unknown as Types.ObjectId,
    updatedData,
  );
  auditTrailService.create({
    action: `Updated ticket ${id}`,
    payload: result,
    request: req,
  });
  res.status(200).json(createSuccessResponse(result));
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  await ticketService.updateById(id as unknown as Types.ObjectId, {
    deletedAt: new Date(),
  });
  auditTrailService.create({
    action: `Deleted ticket ${id}`,
    payload: {},
    request: req,
  });
  res.status(200).json(createSuccessResponse({}));
};
