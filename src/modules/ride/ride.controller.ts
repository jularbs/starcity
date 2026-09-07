import { rideService } from './ride.service.js';
import formidable from 'formidable';
import slugify from 'slugify';
import { uploadFile } from '../../common/object-storage/amazon-s3.js';
import { createEntry } from '../auditTrail/auditTrail.controller.js';
export const create = (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, description, heightRequirements, categoryId, status } =
      fields;
    const { image } = files;

    const slug = slugify.default(name).toLowerCase();

    if (image) {
      if (image.size > 1000000) {
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
          image,
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
            name,
            description,
            slug,
            status,
            heightRequirements,
            rideCategoryId: categoryId,
            media: imageInfo,
          };
          const result = await rideService.create(rideData);
          const r = await result.populate('rideCategoryId', 'name');
          res.status(200).json({ data: r, success: 'Ride added successfully' });
          createEntry(req.profile.name, `Create new ride`, { result }, req);
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

    const ride = await rideService.getBySlug(slug);

    if (!ride) {
      return res.status(400).json({
        error:
          'Ride/Attraction not found. Please try refreshing the page to try again.',
        message: 'Ride not found',
      });
    }

    let imageInfo;
    if (image) {
      if (image.size > 1000000) {
        return res.status(400).json({
          error: 'Image too large. ( > 1MB ).',
        });
      }

      const date = new Date();
      const month = date.getUTCMonth() + 1; //months from 1-12
      const year = date.getUTCFullYear();

      imageInfo = await uploadFile(image, `ride/${year}/${month}/${slug}`);
    }

    const rideData = {
      name,
      description,
      status,
      heightRequirements,
      rideCategoryId: categoryId,
      ...(imageInfo && imageInfo.location && { media: imageInfo }),
    };

    try {
      const result = await rideService.updateById(ride._id, rideData);
      const r = await result.populate('rideCategoryId', 'name _id');
      createEntry(req.profile.name, `Updated ride ${r.name}`, {}, req);

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
  createEntry(req.profile.name, `Deleted ride ${slug}`, { slug }, req);

  //TODO: DELETE IMAGE
  return res.json({ success: 'Ride deleted successfully' });
};
