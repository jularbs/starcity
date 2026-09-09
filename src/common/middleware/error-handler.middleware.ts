import type { NextFunction, Request, Response } from 'express';
import { config } from '../../config/index.js';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('unhandled application error', { err: error });

  const statusCode =
    typeof error === 'object' && error !== null && 'statusCode' in error
      ? Number(error.statusCode)
      : 500;
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : 'INTERNAL_SERVER_ERROR';

  return res
    .status(statusCode >= 400 && statusCode < 600 ? statusCode : 500)
    .json({
      message:
        statusCode === 500 && !config.app.isDevelopment
          ? 'Internal server error'
          : error instanceof Error
            ? error.message
            : 'Internal server error',
      code,
      ...(config.app.isProduction ? null : { details: error }),
      ...(config.app.isProduction ? null : { stack: (error as Error).stack }),
    });
}
