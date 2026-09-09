import slugify from 'slugify';
import { paymentOptionService } from './paymentOption.service.js';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';

export const create = async (req, res) => {
  const { name } = req.body;
  const slug = slugify.default(name).toLowerCase();

  try {
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
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

export const read = async (req, res) => {
  try {
    const data = await paymentOptionService.getBySlug(req.params.slug);

    if (!data) {
      return res.status(404).json({
        error: 'Payment Option not found',
      });
    }

    return res.json(data);
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
      const data = await paymentOptionService.list({ status: true });
      res.json(data);
    } catch (err) {
      return res.status(400).json({
        error: 'error occured',
        message: err,
      });
    }
  } else {
    try {
      const data = await paymentOptionService.list({});
      res.json(data);
    } catch (err) {
      return res.status(400).json({
        error: 'error occured',
        message: err,
      });
    }
  }
};

//TODOS: get id params for update
export const update = async (req, res) => {
  try {
    const { slug, name, status } = req.body;

    const paymentOption = await paymentOptionService.getBySlug(slug);
    if (!paymentOption) {
      return res.status(404).json({
        error: 'Payment Option not found',
      });
    }

    const result = await paymentOptionService.updateById(paymentOption._id, {
      name,
      slug,
      status,
    });

    auditTrailService.create({
      action: `Updated Payment Option ${slug}`,
      payload: { name: name },
      request: req,
    });
    res.json({ result, status: 'success' });
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) {
      return res.status(400).json({
        error: 'Payment Option slug is required',
      });
    }

    const paymentOption = await paymentOptionService.getBySlug(slug);
    if (!paymentOption) {
      return res.status(404).json({
        error: 'Payment Option not found',
      });
    }

    await paymentOptionService.removeById(paymentOption._id);
    res.json({ success: 'Payment Option deleted successfully' });
    auditTrailService.create({
      action: `Deleted Payment Option ${slug}`,
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
  try {
    const { _id } = req.body;
    const paymentOption = await paymentOptionService.getById(_id);

    const result = await paymentOptionService.updateById(paymentOption._id, {
      status: !paymentOption.status,
    });
    auditTrailService.create({
      action: `Toggled Payment Option ${paymentOption.name}`,
      payload: {},
      request: req,
    });
    return res.json({
      data: result,
      success: 'Payment Option toggled successfully!',
    });
  } catch {
    return res
      .status(400)
      .json({ error: 'Unable to toggle payment option status.' });
  }
};
