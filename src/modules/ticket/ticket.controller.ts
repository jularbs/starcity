import type { Request, Response } from 'express';
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
  return res.json({ success: 'Ticket created successfully', data: result });
};

export const read = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const data = await ticketService.getBySlugOrThrow(slug as string);

  res.json(data);
};

export const publicList = async (req: Request, res: Response) => {
  const data = await ticketService.list({ status: true });
  res.json(data);
};

export const manageList = async (req: Request, res: Response) => {
  const data = await ticketService.list({});
  res.json(data);
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
  res.json({ result, success: 'Ticket updated successfully!' });
  auditTrailService.create({
    action: `Updated ticket ${name}`,
    payload: result,
    request: req,
  });
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  await ticketService.updateById(id as unknown as Types.ObjectId, {
    deletedAt: new Date(),
  });
  res.json({ success: 'Ticket deleted successfully' });
  auditTrailService.create({
    action: `Deleted ticket ${id}`,
    payload: {},
    request: req,
  });
};
