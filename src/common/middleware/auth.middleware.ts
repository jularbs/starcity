import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../types/request.types.js';

export const requireSignin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : null;

  if (!token)
    return res
      .status(401)
      .json({ error: 'Auth token required for this request' });

  jwt.verify(token, config.auth.jwtSecret, async (err, decoded) => {
    //Handle Errors
    if (err) {
      if (err.name === 'TokenExpiredError')
        return res.status(401).json({ error: 'Authentication Expired' });

      if (err.name === 'JsonWebTokenError')
        return res.status(401).json({ error: 'Invalid Authentication' });

      if (err.name === 'NotBeforeError')
        return res.status(401).json({ error: 'Invalid Authentication' });
    } else {
      //proceed
      if (typeof decoded !== 'string' && decoded) {
        req.profile = decoded as jwt.JwtPayload & {
          department?: string;
          name?: string;
          _id?: string;
        };
      }
      next();
    }
  });
};

export const authzMiddleware =
  (...department) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.profile?.department;

    if (!userRole || (department.length && !department.includes(userRole))) {
      return res
        .status(403)
        .json({ error: "You don't have permission to make this request" });
    }

    next();
  };
