import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'application/pdf',
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/webp',
]);

export class UploadValidationError extends Error {
  statusCode = 400;
  code = 'INVALID_UPLOAD';
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new UploadValidationError(`Unsupported file type: ${file.mimetype}`),
      );
    }

    return callback(null, true);
  },
});

const isPdf = (buffer: Buffer) => buffer.subarray(0, 5).toString() === '%PDF-';

const validateFileContent = async (file: Express.Multer.File) => {
  if (file.mimetype === 'application/pdf') {
    if (!isPdf(file.buffer)) {
      throw new UploadValidationError('Uploaded file is not a valid PDF');
    }

    return;
  }

  try {
    await sharp(file.buffer).metadata();
  } catch {
    throw new UploadValidationError('Uploaded file is not a valid image');
  }
};

export async function validateUploadedFile(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  if (!request.file) {
    return next();
  }

  try {
    await validateFileContent(request.file);
    return next();
  } catch (error) {
    return next(error);
  }
}
