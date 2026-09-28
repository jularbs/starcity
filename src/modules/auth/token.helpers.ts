import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { Types } from 'mongoose';

export interface AccessTokenPayload {
  sub: Types.ObjectId;
  roles: string;
  jti: string;
  exp?: number;
}

export function generateAccessTokenId(): string {
  return crypto.randomUUID();
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: `${config.auth.jwtExpiresInMinutes}m`,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.auth.jwtSecret) as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpirationDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.auth.refreshExpiresInDays);
  return expiresAt;
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getPasswordResetExpirationDate(): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(
    expiresAt.getMinutes() + config.auth.passwordResetExpiresInMinutes,
  );
  return expiresAt;
}
