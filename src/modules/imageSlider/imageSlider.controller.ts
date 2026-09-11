import slugify from 'slugify';
import { Request, Response } from 'express';
import { uploadFile } from '../../common/object-storage/amazon-s3.js';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import { imageSliderService } from './imageSlider.service.js';
export const create = async (req: Request, res: Response) => {
  const { order, name, startDate, endDate } = req.body;
  const imageFile = req.file;

  if (!name) {
    return res.status(400).json({
      error: 'Name identifier is required',
    });
  }

  if (!startDate) {
    return res.status(400).json({
      error: 'Start date is required',
    });
  }

  if (!endDate) {
    return res.status(400).json({
      error: 'End date is required',
    });
  }

  const slug = slugify.default(name).toLowerCase();

  if (!imageFile) {
    return res.status(400).json({
      error: 'Image is required',
    });
  }

  if (imageFile.size > 1000000) {
    return res.status(400).json({
      error: 'Image too large. ( > 1MB ).',
    });
  }

  const date = new Date();
  const month = date.getUTCMonth() + 1; //months from 1-12
  const year = date.getUTCFullYear();

  let imageInfo;

  try {
    imageInfo = await uploadFile(
      imageFile,
      `image-slider/${year}/${month}/${slug}`,
    );
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ error: 'Error on uploading image to Amazon S3' });
  }

  try {
    const imageSliderData = {
      order: parseInt(order, 10),
      name,
      slug,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      image: imageInfo,
      status: false,
    };

    const result = await imageSliderService.create(imageSliderData);

    res.json({
      data: result,
      success: 'Slider Item added successfully!',
    });

    auditTrailService.create({
      action: 'Create new Image Slider Item',
      request: req,
      payload: { ...result, image: null },
    });
  } catch (err) {
    console.log('Error on save: ', err);
    res.status(400).json({
      error: 'Failed to add item in image slider. Please try again later.',
    });
  }
};

export const read = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const is = await imageSliderService.getBySlug(slug as string);

  if (!is) {
    return res.status(400).json({
      error: 'Image Slider item not found',
    });
  }

  return res.json(is);
};

export const list = async (req: Request, res: Response) => {
  try {
    const result = await imageSliderService.list();
    res.json(result);
  } catch (err) {
    console.log('Error: ', err);
    return res.status(400).json({
      error: 'Error on getting image slider items',
    });
  }
};

export const update = async (req: Request, res: Response) => {
  const { order, name, startDate, endDate, slug } = req.body;
  const imageFile = req.file;
  const imageSlider = await imageSliderService.getBySlug(slug);

  if (!imageSlider) {
    return res.status(400).json({
      error: 'Image Slider item not found',
    });
  }

  const imageSliderData = {
    order: parseInt(order, 10),
    name,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  };

  if (imageFile) {
    if (imageFile.size > 1000000) {
      return res.status(400).json({
        error: 'Image too large. ( > 1MB ).',
      });
    }

    const date = new Date();
    const month = date.getUTCMonth() + 1; //months from 1-12
    const year = date.getUTCFullYear();

    const imageInfo = await uploadFile(
      imageFile,
      `image-slider/${year}/${month}/${slug}`,
    );

    imageSliderData['image'] = imageInfo;
  }

  try {
    const result = await imageSliderService.updateById(
      imageSlider._id,
      imageSliderData,
    );
    auditTrailService.create({
      action: `Updated Image Slider Item ${slug}`,
      payload: { ...result, image: null },
      request: req,
    });
    return res.json({
      data: result,
      success: 'Image Slider item updated successfully!',
    });
  } catch (err) {
    console.log('Error: ', err);
    return res.status(400).json({
      error: 'Failed to update item in image slider. Please try again later.',
    });
  }
};

export const remove = async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      error: 'Image Slider item slug is required',
    });
  }

  const imageSlider = await imageSliderService.getBySlug(slug as string);

  if (!imageSlider) {
    return res.status(400).json({
      error: 'Image Slider item not found',
    });
  }

  await imageSliderService.deleteById(imageSlider._id);

  auditTrailService.create({
    action: `Deleted Image Slider Item ${slug}`,
    payload: {},
    request: req,
  });
  return res.json({ success: 'Image Slider Item deleted successfully' });
};

export const toggleStatus = async (req: Request, res: Response) => {
  const { id } = req.body;

  const imageSlider = await imageSliderService.getById(id);

  if (!imageSlider) {
    return res.status(400).json({
      error: 'Image Slider item not found',
    });
  }

  try {
    const imageSliderData = {
      status: !imageSlider.status,
    };

    const result = await imageSliderService.updateById(
      imageSlider._id,
      imageSliderData,
    );

    auditTrailService.create({
      action: `Toggled Image Slider Item ${result.slug} status`,
      payload: { status: result.status },
      request: req,
    });
    return res.json({
      data: result,
      success: 'Image Slider Item toggled successfully!',
    });
  } catch (err) {
    console.log('Error: ', err);
    return res.status(400).json({
      error: 'Failed to toggle item in image slider. Please try again later.',
    });
  }
};
