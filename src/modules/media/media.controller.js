import formidable from 'formidable';
import { pipeline } from 'node:stream/promises';
import {
  getObjectFromS3,
  uploadFile,
} from '../../common/object-storage/amazon-s3.js';
import { config } from '../../config/index.js';

export const getMedia = async (req, res) => {
  const { key, bucket = config.aws.s3.bucketName } = req.query;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Media key is required' });
  }

  try {
    const data = await getObjectFromS3(key, bucket);
    res.setHeader(
      'Content-Type',
      data.ContentType || 'application/octet-stream',
    );
    if (data.ContentLength) {
      res.setHeader('Content-Length', data.ContentLength);
    }

    await pipeline(data.Body, res);
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    return res.status(400).json({ error: 'Media not found' });
  }
};

export const uploadMediaFromEditor = async (req, res) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err);
    }
    const { image } = files;
    var date = new Date();
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();

    try {
      const imageInfo = await uploadFile(
        image,
        `attachments/${year}/${month}/${image.name}`,
      );
      if (imageInfo.bucket && imageInfo.key) {
        //return string URL for getMedia
        return res.json(imageInfo);
      }
    } catch (err) {
      console.log('Error on upload: ', err);
      return res
        .status(400)
        .json({ error: 'File Upload failed. Please try again later.' });
    }
  });
};
