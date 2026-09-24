import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from '../errors/app-error.js';
import { createErrorResponse } from '../errors/error-response.js';
import { config } from '../../config/index.js';

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json(
        createErrorResponse({
          message: 'File is too large. Maximum size is 3 MB.',
          code: 'FILE_TOO_LARGE',
        }),
      );
    }

    return res.status(400).json(
      createErrorResponse({
        message: error.message,
        code: 'INVALID_UPLOAD',
      }),
    );
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      console.error({ err: error }, 'application error');
    } else {
      console.warn(
        { code: error.code, message: error.message, details: error.details },
        'request rejected',
      );
    }

    return res.status(error.statusCode).json(
      createErrorResponse({
        message: error.message,
        code: error.code,
        details: error.details,
      }),
    );
  }

  console.error({ err: error }, 'unhandled application error');

  return res.status(500).json(
    createErrorResponse({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      details: config.app.isProduction ? null : error,
    }),
  );
}
