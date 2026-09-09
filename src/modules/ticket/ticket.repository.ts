import Ticket from './ticket.model.js';
import type { Types } from 'mongoose';

type CreateTicket = {
  name: string;
  slug: string;
  details: string;
  shortDescription: string;
  price: number;
  status: boolean;
  itemCode: string;
  meta: Record<string, any> | undefined;
};

type ListFilters = {
  status?: boolean;
};

const create = async (data: CreateTicket) => {
  return Ticket.create(data);
};

const updateById = async (id: Types.ObjectId, data: Partial<CreateTicket>) => {
  return Ticket.findByIdAndUpdate(id, data, { returnDocument: 'after' });
};

const findById = async (id: Types.ObjectId) => {
  return Ticket.findById(id);
};

const getBySlug = async (slug: string) => {
  return Ticket.findOne({ slug: slug, deletedAt: null });
};

const list = async (filters: ListFilters) => {
  return Ticket.find({ ...filters, deletedAt: null });
};

export const ticketRepository = {
  create,
  updateById,
  findById,
  getBySlug,
  list,
};
