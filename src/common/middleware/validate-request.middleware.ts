import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';

type RequestSchemas = {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
  file?: z.ZodType;
  files?: z.ZodType;
  cookies?: z.ZodType;
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
        Object.defineProperty(req, 'query', {
          value: schemas.query.parse(req.query) as Request['query'],
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request['params'];
      }
      // Wrapped so file issues get a path (e.g. fieldErrors.file) instead of formErrors
      if (schemas.file) {
        const parsed = z
          .object({ file: schemas.file })
          .parse({ file: req.file });
        req.file = parsed.file as Express.Multer.File;
      }
      if (schemas.files) {
        const parsed = z
          .object({ files: schemas.files })
          .parse({ files: req.files });
        req.files = parsed.files as
          Express.Multer.File[] | Record<string, Express.Multer.File[]>;
      }
      if (schemas.cookies) {
        req.cookies = schemas.cookies.parse(req.cookies) as Request['cookies'];
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
