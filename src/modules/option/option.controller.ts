import slugify from 'slugify';
import { optionService } from './option.service.js';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

export const manage = async (req: Request, res: Response) => {
  const { name, value } = req.body;
  const option = await optionService.getByName(name);

  if (option) {
    const updateParams = {
      value: value,
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
  } else {
    const normalizedName = name
      .trim()
      .split('_')
      .join('')
      .split('-')
      .join(' ')
      .toLowerCase();

    const slug = slugify.default(normalizedName).toLowerCase();

    const newOptionData = {
      name: name,
      slug: slug,
      value: value,
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
  }
};

export const read = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const data = await optionService.getBySlugOrThrow(slug as string);

  res.json(data);
};

export const list = async (req: Request, res: Response) => {
  const { skip = 0, limit = 10 } = req.query;
  const options = await optionService.list({
    skip: Number(skip),
    limit: Number(limit),
  });
  res.json(options);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  await optionService.deleteById(id as unknown as Types.ObjectId);
  res.json({ success: 'Option deleted successfully' });
};
