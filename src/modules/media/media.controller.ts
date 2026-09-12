import { pipeline } from 'node:stream/promises';
import {
  getObjectFromS3,
  uploadFile,
} from '../../common/object-storage/amazon-s3.js';
import { config } from '../../config/index.js';
import { Request, Response } from 'express';
import { createErrorResponse } from '../../common/errors/error-response.js';

export const getMedia = async (req: Request, res: Response) => {
  const { key } = req.query;
  const bucket = config.aws.s3.bucketName;

  try {
    const data = await getObjectFromS3(key as string, bucket as string);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
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

    return res.status(404).json(
      createErrorResponse({
        code: 'MEDIA_NOT_FOUND',
        message: 'Media not found',
      }),
    );
  }
};

export const uploadMediaFromEditor = async (req: Request, res: Response) => {
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  try {
    const imageInfo = await uploadFile(
      imageFile,
      `attachments/${year}/${month}`,
    );
    return res.json(imageInfo);
  } catch (err) {
    console.log('Error on upload: ', err);
    return res
      .status(400)
      .json({ error: 'File Upload failed. Please try again later.' });
  }
};
