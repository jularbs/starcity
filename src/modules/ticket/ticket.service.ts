import { AppError } from '../../common/errors/app-error.js';
import { ticketRepository } from './ticket.repository.js';
import type { Types } from 'mongoose';

type CreateTicketInput = {
  name: string;
  slug: string;
  details: string;
  shortDescription: string;
  price: number;
  status: boolean;
  itemCode: string;
  meta: Record<string, any> | undefined;
};

type UpdateTicketInput = Partial<CreateTicketInput> & {
  deletedAt?: Date | null;
};

const create = async (data: CreateTicketInput) => {
  const existingTicket = await ticketRepository.getBySlug(data.slug);
  if (existingTicket) {
    throw new AppError({
      message: 'Ticket with this slug already exists',
      statusCode: 400,
      code: 'TICKET_SLUG_EXISTS ',
    });
  }
  return ticketRepository.create(data);
};

const updateById = async (id: Types.ObjectId, data: UpdateTicketInput) => {
  const ticket = await ticketRepository.findById(id);
  if (!ticket) {
    throw new AppError({
      message: 'Ticket not found',
      statusCode: 404,
      code: 'TICKET_NOT_FOUND',
    });
  }

  if (data.slug && data.slug !== ticket.slug) {
    const existingTicket = await ticketRepository.getBySlug(data.slug);
    if (
      existingTicket &&
      ticket._id.toString() !== existingTicket._id.toString()
    ) {
      throw new AppError({
        message: 'Ticket slug is already taken, contact support for assistance',
        statusCode: 400,
        code: 'TICKET_SLUG_EXISTS',
      });
    }
  }

  return ticketRepository.updateById(id, data);
};

const getById = async (id: Types.ObjectId) => {
  return ticketRepository.findById(id);
};

const getBySlug = async (slug: string) => {
  return ticketRepository.getBySlug(slug);
};

const getBySlugOrThrow = async (slug: string) => {
  const ticket = await ticketRepository.getBySlug(slug);
  if (!ticket) {
    throw new AppError({
      message: 'Ticket not found',
      statusCode: 404,
      code: 'TICKET_NOT_FOUND',
    });
  }
  return ticket;
};

const list = async (filters: { status?: boolean }) => {
  return ticketRepository.list(filters);
};

const getCurrentPriceById = async (id: Types.ObjectId) => {
  const ticket = await ticketRepository.findById(id);
  if (!ticket) {
    throw new AppError({
      message: 'Ticket not found',
      statusCode: 404,
      code: 'TICKET_NOT_FOUND',
    });
  }
  return ticket.price;
};

export const ticketService = {
  create,
  updateById,
  getById,
  getBySlug,
  list,
  getBySlugOrThrow,
  getCurrentPriceById,
};
