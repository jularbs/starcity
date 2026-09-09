import { rideService } from './ride.service.js';
import formidable from 'formidable';
import slugify from 'slugify';
import { uploadFile } from '../../common/object-storage/amazon-s3.js';
import type { Types } from 'mongoose';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';

export const create = (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, description, heightRequirements, categoryId, status } =
      fields;
    const { image } = files;

    const slug = slugify.default(name as string).toLowerCase();

    if (image) {
      const imageFile = Array.isArray(image) ? image[0] : image;
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
          `ride/${year}/${month}/${slug}`,
          600,
        );
      } catch (err) {
        console.log('Error on upload: ', err);
        return res
          .status(400)
          .json({ error: 'Error on uploading image to Amazon S3' });
      }

      if (imageInfo.location && imageInfo.bucket && imageInfo.key) {
        try {
          const rideData = {
            name: Array.isArray(name) ? name[0] : name,
            description: Array.isArray(description)
              ? description[0]
              : description,
            slug,
            status: Array.isArray(status) ? status[0] : status,
            heightRequirements: Array.isArray(heightRequirements)
              ? heightRequirements[0]
              : heightRequirements,
            rideCategoryId: Array.isArray(categoryId)
              ? (categoryId[0] as unknown as Types.ObjectId)
              : (categoryId as unknown as Types.ObjectId),
            media: imageInfo,
          };
          const result = await rideService.create(rideData);
          const r = await result.populate('rideCategoryId', 'name');
          res.status(200).json({ data: r, success: 'Ride added successfully' });
          auditTrailService.create({
            action: `Create new ride`,
            payload: { result },
            request: req,
          });
        } catch {
          return res.status(400).json({
            error: 'Failed to add new ride/attraction. Please try again later',
          });
        }
      } else {
        res
          .status(400)
          .json({ error: 'Unable to upload image. Please try again later.' });
      }
    } else {
      res.status(400).json({ error: 'Image is required' });
    }
  });
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
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, slug, description, heightRequirements, status, categoryId } =
      fields;
    const { image } = files;

    const ride = await rideService.getBySlug(
      Array.isArray(slug) ? slug[0] : slug,
    );

    if (!ride) {
      return res.status(400).json({
        error:
          'Ride/Attraction not found. Please try refreshing the page to try again.',
        message: 'Ride not found',
      });
    }

    let imageInfo;
    if (image) {
      const imageFile = Array.isArray(image) ? image[0] : image;
      if (imageFile.size > 1000000) {
        return res.status(400).json({
          error: 'Image too large. ( > 1MB ).',
        });
      }

      const date = new Date();
      const month = date.getUTCMonth() + 1; //months from 1-12
      const year = date.getUTCFullYear();

      imageInfo = await uploadFile(imageFile, `ride/${year}/${month}/${slug}`);
    }

    const rideData = {
      name: Array.isArray(name) ? name[0] : name,
      description: Array.isArray(description) ? description[0] : description,
      status: Array.isArray(status) ? status[0] : status,
      heightRequirements: Array.isArray(heightRequirements)
        ? heightRequirements[0]
        : heightRequirements,
      rideCategoryId: Array.isArray(categoryId)
        ? (categoryId[0] as unknown as Types.ObjectId)
        : (categoryId as unknown as Types.ObjectId),
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
  });
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
