import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetPassword } from './auth.controller.js';
import { passwordResetTokenRepository } from './passwordResetToken.repository.js';
import { refreshTokenRepository } from './refreshToken.repository.js';
import { passwordStrengthValidation } from './password.helpers.js';
import { userService } from '../user/user.service.js';

vi.mock('./passwordResetToken.repository.js', () => ({
  passwordResetTokenRepository: {
    findActiveByToken: vi.fn(),
    consumeByToken: vi.fn(),
    removeAllForUser: vi.fn(),
  },
}));
vi.mock('./refreshToken.repository.js', () => ({
  refreshTokenRepository: { removeAllForUser: vi.fn() },
}));
vi.mock('./revokedAccessToken.repository.js', () => ({
  revokedAccessTokenRepository: {},
}));
vi.mock('./password.helpers.js', () => ({
  generateSalt: vi.fn(() => 'salt'),
  encryptPassword: vi.fn(() => 'hashed-password'),
  authenticate: vi.fn(),
  passwordStrengthValidation: vi.fn(),
}));
vi.mock('./token.helpers.js', () => ({
  generateAccessTokenId: vi.fn(),
  generateRefreshToken: vi.fn(),
  generatePasswordResetToken: vi.fn(),
  hashRefreshToken: vi.fn(),
  hashPasswordResetToken: vi.fn(() => 'hashed-token'),
  getPasswordResetExpirationDate: vi.fn(),
  signAccessToken: vi.fn(),
  verifyAccessToken: vi.fn(),
}));
vi.mock('../../config/index.js', () => ({ config: {} }));
vi.mock('./mfa.service.js', () => ({ mfaService: {} }));
vi.mock('../email/email.service.js', () => ({ emailService: {} }));
vi.mock('../auditTrail/auditTrail.service.js', () => ({
  auditTrailService: { create: vi.fn() },
}));
vi.mock('../user/user.service.js', () => ({
  userService: { getById: vi.fn(), updateById: vi.fn() },
}));

describe('resetPassword', () => {
  const userId = new Types.ObjectId();
  const resetToken = { userId };
  const response = { status: vi.fn(), json: vi.fn() };
  const submitPassword = (newPassword: string) =>
    resetPassword(
      { body: { token: 'raw-token', newPassword } } as never,
      response as never,
    );

  beforeEach(() => {
    vi.resetAllMocks();
    response.status.mockReturnValue(response);
    vi.mocked(passwordResetTokenRepository.findActiveByToken).mockResolvedValue(
      resetToken as never,
    );
    vi.mocked(passwordResetTokenRepository.consumeByToken).mockResolvedValue(
      resetToken as never,
    );
    vi.mocked(userService.getById).mockResolvedValue({
      _id: userId,
      name: 'Test User',
      email: 'test@example.com',
      status: true,
    } as never);
    vi.mocked(passwordStrengthValidation).mockResolvedValue({
      score: 4,
    } as never);
  });

  it('preserves the token after a weak password and accepts a stronger retry', async () => {
    vi.mocked(passwordStrengthValidation).mockResolvedValueOnce({
      score: 1,
      feedback: { warning: 'Too weak', suggestions: [] },
    } as never);

    await expect(submitPassword('weak')).rejects.toMatchObject({
      code: 'PASSWORD_POLICY',
    });
    expect(passwordResetTokenRepository.consumeByToken).not.toHaveBeenCalled();
    expect(userService.updateById).not.toHaveBeenCalled();
    expect(
      passwordResetTokenRepository.removeAllForUser,
    ).not.toHaveBeenCalled();

    await submitPassword('strong-password');

    expect(passwordResetTokenRepository.findActiveByToken).toHaveBeenCalledWith(
      'hashed-token',
    );
    expect(
      passwordResetTokenRepository.consumeByToken,
    ).toHaveBeenCalledExactlyOnceWith('hashed-token');
    expect(userService.updateById).toHaveBeenCalledExactlyOnceWith(userId, {
      hashed_password: 'hashed-password',
      salt: 'salt',
      mistakes: 0,
    });
    expect(refreshTokenRepository.removeAllForUser).toHaveBeenCalledWith(
      userId,
    );
    expect(passwordResetTokenRepository.removeAllForUser).toHaveBeenCalledWith(
      userId,
    );
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('rejects an invalid or expired token before password validation', async () => {
    vi.mocked(passwordResetTokenRepository.findActiveByToken).mockResolvedValue(
      null,
    );

    await expect(submitPassword('strong-password')).rejects.toMatchObject({
      code: 'INVALID_RESET_TOKEN',
    });
    expect(passwordStrengthValidation).not.toHaveBeenCalled();
    expect(passwordResetTokenRepository.consumeByToken).not.toHaveBeenCalled();
    expect(userService.updateById).not.toHaveBeenCalled();
  });

  it('rejects a token that expires or is revoked during validation', async () => {
    vi.mocked(passwordResetTokenRepository.consumeByToken).mockResolvedValue(
      null,
    );

    await expect(submitPassword('strong-password')).rejects.toMatchObject({
      code: 'INVALID_RESET_TOKEN',
    });
    expect(userService.updateById).not.toHaveBeenCalled();
    expect(refreshTokenRepository.removeAllForUser).not.toHaveBeenCalled();
  });

  it('allows only one concurrent request to change the password', async () => {
    vi.mocked(passwordResetTokenRepository.consumeByToken)
      .mockResolvedValueOnce(resetToken as never)
      .mockResolvedValueOnce(null);

    const results = await Promise.allSettled([
      submitPassword('strong-password-one'),
      submitPassword('strong-password-two'),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.find((result) => result.status === 'rejected'),
    ).toMatchObject({
      reason: { code: 'INVALID_RESET_TOKEN' },
    });
    expect(userService.updateById).toHaveBeenCalledTimes(1);
  });
});
