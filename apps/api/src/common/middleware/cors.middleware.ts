import cors from 'cors';
import { config } from '../../config/index.js';
import { AppError } from '../errors/app-error.js';

const allowedDomains = config.cors.origin;

const isOriginAllowed = async (origin: string | undefined) => {
  if (!origin) return true;
  return allowedDomains.includes(origin);
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    isOriginAllowed(origin)
      .then((allowed) => {
        if (allowed) return callback(null, true);

        callback(
          new AppError({
            message: `This site ${origin} does not have access.`,
            statusCode: 403,
            code: 'CORS_NOT_ALLOWED',
          }),
        );
      })
      .catch(callback);
  },
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
});
