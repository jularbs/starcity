import slugify from 'slugify';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import { ticketService } from './ticket.service.js';

export const create = async (req, res) => {
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

  try {
    const result = await ticketService.create(ticketData);
    auditTrailService.create({
      action: `Created New Ticket ${name}`,
      payload: result,
      request: req,
    });
    return res.json({ success: 'Ticket created successfully', data: result });
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

export const read = async (req, res) => {
  try {
    const data = await ticketService.getBySlug(req.params.slug);

    if (!data) {
      return res.status(404).json({
        error: 'Ticket not found',
      });
    }

    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

export const list = async (req, res) => {
  const { f } = req.query;

  if (f) {
    try {
      const data = await ticketService.list({ status: true });
      res.json(data);
    } catch (err) {
      return res.status(400).json({
        error: 'error occured',
        message: err,
      });
    }
  } else {
    try {
      const data = await ticketService.list({});
      res.json(data);
    } catch (err) {
      return res.status(400).json({
        error: 'error occured',
        message: err,
      });
    }
  }
};

export const update = async (req, res) => {
  const { name, _id, shortDescription, price, details, code } = req.body;

  const ticket = await ticketService.getById(_id);

  const updatedData = {
    name,
    slug: ticket.slug,
    itemCode: code,
    shortDescription,
    price,
    details,
  };

  if (name !== ticket.name) {
    updatedData.slug = slugify.default(name).toLowerCase();
  }

  try {
    const result = await ticketService.updateById(_id, updatedData);
    res.json({ result, success: 'Ticket updated successfully!' });
    auditTrailService.create({
      action: `Updated ticket ${name}`,
      payload: result,
      request: req,
    });
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

export const remove = async (req, res) => {
  const { _id } = req.body;

  try {
    if (!_id) {
      return res.status(400).json({
        error: 'Ticket ID is required',
      });
    }

    await ticketService.updateById(_id, { deletedAt: new Date() });
    res.json({ success: 'Ticket deleted successfully' });
    auditTrailService.create({
      action: `Deleted ticket ${_id}`,
      payload: {},
      request: req,
    });
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

export const toggleStatus = async (req, res) => {
  const { _id } = req.body;

  const ticket = await ticketService.getById(_id);

  try {
    const result = await ticketService.updateById(_id, {
      status: !ticket.status,
    });
    auditTrailService.create({
      action: `Toggled ticket ${ticket.name}`,
      payload: { status: result.status },
      request: req,
    });
    return res.json({
      success: 'Ticket toggled successfully',
      data: result,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Unable to toggle ticket status.', message: err });
  }
};
