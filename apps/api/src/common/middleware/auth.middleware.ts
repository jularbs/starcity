import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../types/request.types.js';
import { revokedAccessTokenRepository } from '../../modules/auth/revokedAccessToken.repository.js';
import { hashRefreshToken } from '../../modules/auth/token.helpers.js';
import { refreshTokenRepository } from '../../modules/auth/refreshToken.repository.js';
import { userService } from '../../modules/user/user.service.js';
import { Types } from 'mongoose';

const authenticateSession =
  (allowMfaEnrollment: boolean) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
        return res.status(401).json({ error: 'Invalid Authentication' });
      } else {
        if (typeof decoded === 'string' || !decoded) {
          return res.status(401).json({ error: 'Invalid Authentication' });
        }
        try {
          if (
            decoded.jti &&
            (await revokedAccessTokenRepository.isRevoked(decoded.jti))
          )
            return res.status(401).json({ error: 'Authentication revoked' });

          const refreshToken = req.cookies?.refreshToken;
          const activeSession = refreshToken
            ? await refreshTokenRepository.touchIfActive(
                hashRefreshToken(refreshToken),
                config.auth.idleTimeoutInMinutes * 60 * 1000,
              )
            : null;

          if (!activeSession) {
            return res.status(401).json({
              error: 'Session idle timeout. Please sign in again.',
              code: 'SESSION_IDLE_TIMEOUT',
            });
          }

          if (!decoded.sub || activeSession.userId.toString() !== decoded.sub) {
            return res.status(401).json({ error: 'Invalid authentication' });
          }

          const user = await userService.getById(
            decoded.sub as unknown as Types.ObjectId,
          );
          if (!user || !user.status) {
            return res.status(401).json({ error: 'Invalid authentication' });
          }
          if (!allowMfaEnrollment && (!user.mfaEnabledAt || !user.mfaSecret)) {
            return res.status(403).json({
              error: 'Set up two-factor authentication to continue.',
              code: 'MFA_ENROLLMENT_REQUIRED',
            });
          }

          req.profile = decoded as jwt.JwtPayload & {
            sub?: string;
            roles?: string;
          };
          next();
        } catch (error) {
          next(error);
        }
      }
    });
  };

export const requireSignin = authenticateSession(false);
export const requireSigninForMfaEnrollment = authenticateSession(true);

export const authzMiddleware =
  (...department) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.profile?.roles;

    if (!userRole || (department.length && !department.includes(userRole))) {
      return res
        .status(403)
        .json({ error: "You don't have permission to make this request" });
    }

    next();
  };
