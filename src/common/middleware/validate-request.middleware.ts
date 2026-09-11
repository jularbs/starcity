import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';

type RequestSchemas = {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
  file?: z.ZodType;
  files?: z.ZodType;
};

export function validateRequest(schemas: RequestSchemas) {
  return function validationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as Request['body'];
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request['query'];
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request['params'];
      }
      if (schemas.file) {
        req.file = schemas.file.parse(req.file) as Express.Multer.File;
      }
      if (schemas.files) {
        req.files = schemas.files.parse(req.files) as
          Express.Multer.File[] | Record<string, Express.Multer.File[]>;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError({
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            details: z.flattenError(error).fieldErrors,
          }),
        );
      }

      return next(error);
    }
  };
}
