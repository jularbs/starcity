import ImageSlider from './imageSlider.model.js';
import slugify from 'slugify';
import formidable from 'formidable';
import { uploadFile } from '../../common/object-storage/amazon-s3.js';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';

export const create = (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { order, name, startDate, endDate } = fields;
    const { image } = files;

    if (!name || !name.length) {
      return res.status(400).json({
        error: 'Name identifier is required',
      });
    }

    if (!startDate || !startDate.length) {
      return res.status(400).json({
        error: 'Start date is required',
      });
    }

    if (!endDate || !endDate.length) {
      return res.status(400).json({
        error: 'End date is required',
      });
    }

    const slug = slugify(name).toLowerCase();

    if (image) {
      if (image.size > 1000000) {
        return res.status(400).json({
          error: 'Image too large. ( > 1MB ).',
        });
      }

      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();

      let imageInfo;

      try {
        imageInfo = await uploadFile(
          image,
          `image-slider/${year}/${month}/${slug}`,
        );
      } catch (err) {
        console.log(err);
        return res
          .status(400)
          .json({ error: 'Error on uploading image to Amazon S3' });
      }

      if (imageInfo.location && imageInfo.bucket && imageInfo.key) {
        try {
          let is = new ImageSlider();
          is.order = order;
          is.name = name;
          is.slug = slug;
          is.startDate = startDate;
          is.endDate = endDate;
          is.image = imageInfo;
          is.status = false;

          const result = await is.save();
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
            error:
              'Failed to add item in image slider. Please try again later.',
          });
        }
      } else {
        res
          .status(400)
          .json({ error: 'Error on uploading image to Amazon S3' });
      }
    } else {
      return res.status(400).json({
        error: 'Image is required',
      });
    }
  });
};

export const read = async (req, res) => {
  const { slug } = req.params;
  const is = await ImageSlider.findOne({ slug }).exec();

  if (is) {
    return res.json(is);
  } else {
    return res.status(400).json({
      error: 'Image Slider item not found',
    });
  }
};

export const list = async (req, res) => {
  try {
    const result = await ImageSlider.find({}).sort({ order: 1 }).exec();
    res.json(result);
  } catch (err) {
    console.log('Error: ', err);
    return res.status(400).json({
      error: 'Error on getting image slider items',
    });
  }
};

export const update = async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { order, name, startDate, endDate, slug } = fields;
    const { image } = files;
    let is = await ImageSlider.findOne({ slug: slug }).exec();
    if (is) {
      is.order = order;
      is.name = name;
      is.startDate = startDate;
      is.endDate = endDate;

      if (image) {
        if (image.size > 1000000) {
          return res.status(400).json({
            error: 'Image too large. ( > 1MB ).',
          });
        }

        var date = new Date();
        var month = date.getUTCMonth() + 1; //months from 1-12
        var year = date.getUTCFullYear();

        let imageInfo;
        try {
          imageInfo = await uploadFile(
            image,
            `image-slider/${year}/${month}/${slug}`,
          );
        } catch (err) {
          console.log('Error on upload: ', err);
          return res
            .status(400)
            .json({ error: 'Error on uploading image to Amazon S3' });
        }
        if (imageInfo.location && imageInfo.bucket && imageInfo.bucket) {
          is.image = imageInfo;
        } else {
          return res
            .status(400)
            .json({ error: 'Error on uploading image to Amazon S3' });
        }
      }
      try {
        const result = await is.save();
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
          error: 'Failed to add item in image slider. Please try again later.',
        });
      }
    } else {
      return res.status(400).json({ error: 'Image Slider item not found' });
    }
  });
};

export const remove = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      error: 'Image Slider item slug is required',
    });
  }

  const data = await ImageSlider.deleteOne({ slug }).exec();

  if (data) {
    auditTrailService.create({
      action: `Deleted Image Slider Item ${slug}`,
      payload: {},
      request: req,
    });
    return res.json({ success: 'Image Slider Item deleted successfully' });
  } else {
    return res.status(400).json({ error: 'Image Slider Item not found' });
  }
};

//TODOS: Remove and use update
export const toggleStatus = async (req, res) => {
  const { id } = req.body;
  let is = await ImageSlider.findOne({ _id: id }).exec();

  if (is) {
    try {
      is.status = !is.status;
      const result = await is.save();
      auditTrailService.create({
        action: `Toggled Image Slider Item ${result.name}`,
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
  } else {
    return res.status(404).json({ error: 'Image Slider Item not found.' });
  }
};
