import express from 'express';
import cookieParser from 'cookie-parser';
import { Types } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { refreshTokenRepository } from '../../modules/auth/refreshToken.repository.js';
import { revokedAccessTokenRepository } from '../../modules/auth/revokedAccessToken.repository.js';
import { signAccessToken } from '../../modules/auth/token.helpers.js';
import { userService } from '../../modules/user/user.service.js';
import {
  requireSignin,
  requireSigninForMfaEnrollment,
} from './auth.middleware.js';

vi.mock('../../modules/auth/refreshToken.repository.js', () => ({
  refreshTokenRepository: { touchIfActive: vi.fn() },
}));
vi.mock('../../modules/auth/revokedAccessToken.repository.js', () => ({
  revokedAccessTokenRepository: { isRevoked: vi.fn() },
}));
vi.mock('../../modules/user/user.service.js', () => ({
  userService: { getById: vi.fn() },
}));

describe('MFA enrollment gate', () => {
  const userId = new Types.ObjectId();
  const accessToken = signAccessToken({
    sub: userId,
    roles: 'admin',
    jti: 'enrollment-test',
  });
  const app = express();
  app.use(cookieParser());
  app.get('/protected', requireSignin, (_req, res) => res.sendStatus(204));
  app.get('/setup', requireSigninForMfaEnrollment, (_req, res) =>
    res.sendStatus(204),
  );

  beforeEach(() => {
    vi.mocked(revokedAccessTokenRepository.isRevoked).mockResolvedValue(false);
    vi.mocked(refreshTokenRepository.touchIfActive).mockResolvedValue({
      userId,
    } as never);
    vi.mocked(userService.getById).mockResolvedValue({
      _id: userId,
      status: true,
    } as never);
  });

  const getWithSession = (path: string) =>
    request(app)
      .get(path)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', 'refreshToken=active-session');

  it('rejects normal operations until MFA is enrolled', async () => {
    const response = await getWithSession('/protected');
    expect(response.status).toBe(403);
    expect(response.body.code).toBe('MFA_ENROLLMENT_REQUIRED');
  });

  it('allows setup with a valid unenrolled session', async () => {
    expect((await getWithSession('/setup')).status).toBe(204);
  });

  it('allows normal operations once MFA is enabled', async () => {
    vi.mocked(userService.getById).mockResolvedValue({
      _id: userId,
      status: true,
      mfaEnabledAt: new Date(),
      mfaSecret: 'encrypted-secret',
    } as never);

    expect((await getWithSession('/protected')).status).toBe(204);
  });

  it('rejects sessions belonging to a different user', async () => {
    vi.mocked(refreshTokenRepository.touchIfActive).mockResolvedValue({
      userId: new Types.ObjectId(),
    } as never);

    expect((await getWithSession('/setup')).status).toBe(401);
  });
});
