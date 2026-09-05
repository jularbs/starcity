import type { NextFunction, Request, Response } from 'express';
import { config } from '../../config/index.js';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('unhandled application error', { err: error });

  return res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(config.app.isProduction ? null : { details: error }),
    ...(config.app.isProduction ? null : { stack: (error as Error).stack }),
  });
}
