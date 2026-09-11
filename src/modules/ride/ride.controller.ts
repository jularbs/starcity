import { rideService } from './ride.service.js';
import slugify from 'slugify';
import { uploadFile } from '../../common/object-storage/amazon-s3.js';
import type { Types } from 'mongoose';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';

export const create = async (req, res) => {
  const { name, description, heightRequirements, categoryId, status } =
    req.body;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: 'Image is required' });
  }

  if (imageFile.size > 1000000) {
    return res.status(400).json({ error: 'Image too large. ( > 1MB ).' });
  }

  const slug = slugify.default(name).toLowerCase();
  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  try {
    const imageInfo = await uploadFile(
      imageFile,
      `ride/${year}/${month}/${slug}`,
      600,
    );
    const rideData = {
      name,
      description,
      slug,
      status,
      heightRequirements,
      rideCategoryId: categoryId as Types.ObjectId,
      media: imageInfo,
    };
    const result = await rideService.create(rideData);
    const populatedRide = await result.populate('rideCategoryId', 'name');
    res.status(200).json({
      data: populatedRide,
      success: 'Ride added successfully',
    });
    auditTrailService.create({
      action: 'Create new ride',
      payload: { result },
      request: req,
    });
  } catch (error) {
    console.log('Error creating ride: ', error);
    return res.status(400).json({
      error: 'Failed to add new ride/attraction. Please try again later',
    });
  }
};

export const read = async (req, res) => {
  const { slug } = req.params;
  const data = await rideService.getBySlug(slug);
  res.json(data);
};

//TODOS: Paginate
export const list = async (req, res) => {
  try {
    const data = await rideService.list();
    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

//TODOS: Rewrite to use id and service
export const update = async (req, res) => {
  const { name, slug, description, heightRequirements, status, categoryId } =
    req.body;
  const imageFile = req.file;

  const ride = await rideService.getBySlug(slug);

  if (!ride) {
    return res.status(400).json({
      error:
        'Ride/Attraction not found. Please try refreshing the page to try again.',
      message: 'Ride not found',
    });
  }

  let imageInfo;
  if (imageFile) {
    if (imageFile.size > 1000000) {
      return res.status(400).json({
        error: 'Image too large. ( > 1MB ).',
      });
    }

    const date = new Date();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();

    imageInfo = await uploadFile(imageFile, `ride/${year}/${month}/${slug}`);
  }

  const rideData = {
    name,
    description,
    status,
    heightRequirements,
    rideCategoryId: categoryId as Types.ObjectId,
    ...(imageInfo && imageInfo.location && { media: imageInfo }),
  };

  try {
    const result = await rideService.updateById(ride._id, rideData);
    const r = await result.populate('rideCategoryId', 'name _id');
    auditTrailService.create({
      action: `Updated ride ${r.name}`,
      payload: {},
      request: req,
    });

    return res.json({
      result: r,
      success: 'Ride/Attraction updated successfully!',
    });
  } catch (err) {
    return res.status(400).json({
      error: 'Unable to update ride/attraction. Please try again later.',
      message: err,
    });
  }
};

//TODOS: rewrite to use id and service
export const remove = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      error: 'Ride slug is required',
    });
  }

  const ride = await rideService.getBySlug(slug);

  if (!ride) {
    return res.status(400).json({
      error: 'Ride not found',
    });
  }

  await rideService.removeById(ride._id);
  auditTrailService.create({
    action: `Deleted ride ${slug}`,
    payload: { slug },
    request: req,
  });

  //TODO: DELETE IMAGE
  return res.json({ success: 'Ride deleted successfully' });
};
