import slugify from 'slugify';
import { optionService } from './option.service.js';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import type { Request, Response } from 'express';

export const create = async (req: Request, res: Response) => {
  const { name, value, meta } = req.body;
  const option = await optionService.getByName(name);

  if (option) {
    try {
      const updateParams = {
        name: name,
        value: value,
        meta: meta,
      };

      const result = await optionService.updateById(option._id, updateParams);

      auditTrailService.create({
        action: `Option ${name} updated`,
        payload: { value: value },
        request: req,
      });
      return res.json({
        result,
        success: 'Option has been updated successfully!',
      });
    } catch (err) {
      return res.status(400).json({
        error: 'Unable to save option. Please try again later.',
        message: err,
      });
    }
  } else {
    try {
      const slug = slugify.default(name).toLowerCase();

      const newOptionData = {
        name: name,
        slug: slug,
        value: value,
        meta: meta,
      };

      const result = await optionService.create(newOptionData);

      auditTrailService.create({
        action: `Option ${name} created`,
        payload: {
          value: value,
        },
        request: req,
      });
      return res.json({
        result,
        success: 'Option has been created successfully!',
      });
    } catch (err) {
      return res.status(400).json({
        error: 'Unable to save option. Please try again later.',
        message: err,
      });
    }
  }
};

export const read = async (req: Request, res: Response) => {
  const { name } = req.params;
  try {
    const data = await optionService.getByName(name as string);

    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const options = await optionService.list();
    res.json(options);
  } catch {
    res.status(400).json({ error: 'Unable to retrieve options' });
  }
};

//TODOS: deprecate this along with repo and service to use a single endpoint for create and update
export const update = async (req: Request, res: Response) => {
  const { slug, name, value, meta } = req.body;

  const option = await optionService.getBySlug(slug as string);

  option.name = name;
  option.value = value;
  option.meta = meta;

  try {
    const result = await optionService.updateById(option._id, {
      name,
      value,
      meta,
    });
    return res.json({ result, status: 'success' });
  } catch (err) {
    return res.status(400).json({
      error: 'Unable to update option. Please try again later.',
      message: err,
    });
  }
};

//TODOS: change slug to id
export const remove = async (req: Request, res: Response) => {
  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({
      error: 'Option slug is required',
    });
  }

  const option = await optionService.getBySlug(slug as string);

  if (!option) {
    return res.status(400).json({
      error: 'Option not found',
    });
  }

  try {
    await optionService.deleteById(option._id);
    res.json({ success: 'Option deleted successfully' });
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};
