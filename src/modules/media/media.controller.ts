import formidable from 'formidable';
import { pipeline } from 'node:stream/promises';
import {
  getObjectFromS3,
  uploadFile,
} from '../../common/object-storage/amazon-s3.js';
import { config } from '../../config/index.js';
import { Request, Response } from 'express';

export const getMedia = async (req: Request, res: Response) => {
  const { key, bucket = config.aws.s3.bucketName } = req.query;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Media key is required' });
  }

  try {
    const data = await getObjectFromS3(key, bucket as string);
    res.setHeader(
      'Content-Type',
      data.ContentType || 'application/octet-stream',
    );
    if (data.ContentLength) {
      res.setHeader('Content-Length', data.ContentLength);
    }

    await pipeline(data.Body as NodeJS.ReadableStream, res);
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    return res.status(400).json({ error: 'Media not found' });
  }
};

export const uploadMediaFromEditor = async (req: Request, res: Response) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .json({ error: 'File Upload failed. Please try again later.' });
    }
    const { image } = files;
    const imageFile = Array.isArray(image) ? image[0] : image;
    const date = new Date();
    const month = date.getUTCMonth() + 1; //months from 1-12
    const year = date.getUTCFullYear();

    try {
      const imageInfo = await uploadFile(
        imageFile,
        `attachments/${year}/${month}/${imageFile.name}`,
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
