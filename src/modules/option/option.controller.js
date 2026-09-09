import slugify from 'slugify';
import Option from './option.model.js';
import { uploadFile } from '../../common/object-storage/amazon-s3.js';
import formidable from 'formidable';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';

export const logoUpload = async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { value } = files;
    const { name } = fields;

    let imageInfo;
    try {
      imageInfo = await uploadFile(value, `logo-image`);
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ error: 'Error on uploading image to Amazon S3' });
    }

    let option = await Option.findOne({ name }).exec();

    if (option) {
      try {
        option.name = name;
        option.value = imageInfo.location;
        option.meta = imageInfo;
        const result = await option.save();
        res.json({ result, status: 'success' });
        auditTrailService.create({
          action: `Option ${name} updated`,
          payload: imageInfo,
          request: req,
        });
      } catch (err) {
        return res.status(400).json({
          error: 'error occured',
          message: err,
        });
      }
    } else {
      try {
        const slug = slugify(name).toLowerCase();
        let newOption = new Option();

        newOption.name = name;
        newOption.slug = slug;
        newOption.value = value;

        const result = await newOption.save();
        res.json(result);
        auditTrailService.create({
          action: `Option ${name} created`,
          payload: {
            value: imageInfo.location,
          },
          request: req,
        });
      } catch (err) {
        return res.status(400).json({
          error: 'error occured',
          message: err,
        });
      }
    }
  });
};

export const create = async (req, res) => {
  const { name, value, meta } = req.body;
  let option = await Option.findOne({ name }).exec();

  if (option) {
    try {
      option.name = name;
      option.value = value;
      option.meta = meta;
      const result = await option.save();
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
      const slug = slugify(name).toLowerCase();

      let newOption = new Option();

      newOption.name = name;
      newOption.slug = slug;
      newOption.value = value;
      newOption.meta = meta;

      const result = await newOption.save();
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

export const read = async (req, res) => {
  try {
    const data = await Option.findOne({ name: req.params.name })
      .select('name value')
      .exec();
    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

export const list = async (req, res) => {
  try {
    const options = await Option.find().select('name value').exec();
    res.json(options);
  } catch {
    res.status(400).json({ error: 'Unable to retrieve options' });
  }
};

export const update = async (req, res) => {
  const { slug, name, value, meta } = req.body;

  const option = await Option.findOne({ slug: slug }).exec();

  option.name = name;
  option.value = value;
  option.meta = meta;

  try {
    const result = await option.save();
    return res.json({ result, status: 'success' });
  } catch (err) {
    return res.status(400).json({
      error: 'Unable to update option. Please try again later.',
      message: err,
    });
  }
};

export const remove = async (req, res) => {
  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({
      error: 'Option slug is required',
    });
  }

  try {
    await Option.findOneAndDelete({ slug }).exec();
    res.json({ success: 'Option deleted successfully' });
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};
