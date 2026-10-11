import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../common/utils/success-response.js';
import {
  generateSalt,
  encryptPassword,
  authenticate,
  passwordStrengthValidation,
} from './password.helpers.js';
import {
  generateAccessTokenId,
  generateRefreshToken,
  generatePasswordResetToken,
  hashRefreshToken,
  hashPasswordResetToken,
  getPasswordResetExpirationDate,
  signAccessToken,
  verifyAccessToken,
} from './token.helpers.js';
import { config } from '../../config/index.js';
import { refreshTokenRepository } from './refreshToken.repository.js';
import { passwordResetTokenRepository } from './passwordResetToken.repository.js';
import { revokedAccessTokenRepository } from './revokedAccessToken.repository.js';
import { userService } from '../user/user.service.js';
import { emailService } from '../email/email.service.js';
import { AppError } from '../../common/errors/app-error.js';
import { mfaService } from './mfa.service.js';

const completeSignin = async (req: Request, res: Response, user) => {
  const payload = {
    sub: user._id,
    roles: user.department,
    jti: generateAccessTokenId(),
  };
  const token = signAccessToken(payload);
  const refreshToken = generateRefreshToken();

  await refreshTokenRepository.storeRefreshToken(
    user._id,
    hashRefreshToken(refreshToken),
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.auth.cookieSecure,
    sameSite: 'strict',
    maxAge: config.auth.refreshExpiresInDays * 24 * 60 * 60 * 1000,
  });

  await userService.updateById(user._id, {
    mistakes: 0,
    lastLogin: new Date(),
  });
  await auditTrailService.create({
    userId: user._id,
    action: 'Logged in to system',
    request: req,
    payload: { email: user.email },
  });

  return res.status(200).json(
    createSuccessResponse({
      token,
      enrollmentRequired: !user.mfaEnabledAt || !user.mfaSecret,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    }),
  );
};

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const user = await userService.getByEmail(email);

  if (user) {
    return res.status(201).json(
      createSuccessResponse({
        message:
          'If registration is successful, please wait for your account to be processed.',
      }),
    );
  }

  const strength = await passwordStrengthValidation(password, [name, email]);

  if (strength.score < 3) {
    throw new AppError({
      message:
        strength.feedback.warning +
          ' ' +
          strength.feedback.suggestions.join(' ') ||
        'Password does not meet the required strength. Please enter another password',
      code: 'PASSWORD_POLICY',
      statusCode: 400,
    });
  }

  const salt = generateSalt();
  const hashed_password = encryptPassword({ password, salt });

  try {
    await userService.create({
      name,
      email,
      hashed_password,
      salt,
    });
  } catch {
    return res.status(201).json(
      createSuccessResponse({
        message:
          'If registration is successful, please wait for your account to be processed.',
      }),
    );
  }

  return res.status(201).json(
    createSuccessResponse({
      message:
        'If registration is successful, please wait for your account to be processed.',
    }),
  );
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userService.getByEmail(email);

  if (!user) {
    throw new AppError({
      message: 'Email and password do not match.',
      code: 'INVALID_CREDENTIALS',
      statusCode: 400,
    });
  }

  if (user.mistakes > 3) {
    throw new AppError({
      message: 'Email and password do not match.',
      code: 'INVALID_CREDENTIALS',
      statusCode: 400,
    });
  }

  if (
    !authenticate({
      password,
      salt: user.salt,
      hashedPassword: user.hashed_password,
    })
  ) {
    await userService.updateById(user._id, {
      mistakes: user.mistakes + 1,
    });

    throw new AppError({
      message: 'Email and password do not match.',
      code: 'INVALID_CREDENTIALS',
      statusCode: 400,
    });
  }

  if (!user.status) {
    throw new AppError({
      message: 'Email and password do not match.',
      code: 'INVALID_CREDENTIALS',
      statusCode: 400,
    });
  }

  if (user.mfaEnabledAt && user.mfaSecret) {
    const challengeToken = await mfaService.createLoginChallengeForUser(
      user._id,
    );
    return res.status(200).json(
      createSuccessResponse({
        mfaRequired: true,
        challengeToken,
        expiresInSeconds: 300,
      }),
    );
  }

  return completeSignin(req, res, user);
};

export const verifySigninMfa = async (req: Request, res: Response) => {
  const { challengeToken, code } = req.body;
  const challenge = await mfaService.findActiveLoginChallenge(challengeToken);

  if (!challenge) {
    throw new AppError({
      message: 'MFA challenge is invalid or expired',
      code: 'INVALID_MFA_CHALLENGE',
      statusCode: 401,
    });
  }

  const user = await userService.getById(challenge.userId);
  if (!user || !user.status || !user.mfaEnabledAt || !user.mfaSecret) {
    await mfaService.consumeLoginChallenge(challengeToken);
    throw new AppError({
      message: 'MFA challenge is invalid or expired',
      code: 'INVALID_MFA_CHALLENGE',
      statusCode: 401,
    });
  }

  const verifiedFactor = await mfaService.verifyUserFactor(user, code, true);
  if (!verifiedFactor) {
    await mfaService.recordFailedLoginChallengeAttempt(challengeToken);
    throw new AppError({
      message: 'Verification code is invalid',
      code: 'INVALID_MFA_CODE',
      statusCode: 401,
    });
  }

  const consumedChallenge =
    await mfaService.consumeLoginChallenge(challengeToken);
  if (!consumedChallenge) {
    throw new AppError({
      message: 'MFA challenge is invalid or expired',
      code: 'INVALID_MFA_CHALLENGE',
      statusCode: 401,
    });
  }

  return completeSignin(req, res, user);
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    throw new AppError({
      message: 'No refresh token provided.',
      code: 'NO_REFRESH_TOKEN',
      statusCode: 401,
    });
  }

  const hashedRefreshToken = hashRefreshToken(token);
  const storedToken = await refreshTokenRepository.consumeIfActive(
    hashedRefreshToken,
    config.auth.idleTimeoutInMinutes * 60 * 1000,
  );

  if (!storedToken) {
    throw new AppError({
      message: 'Session idle timeout or expired. Please sign in again.',
      code: 'SESSION_IDLE_TIMEOUT',
      statusCode: 401,
    });
  }

  const user = await userService.getById(storedToken.userId);
  if (!user || !user.status) {
    throw new AppError({
      message: 'Invalid or expired refresh token.',
      code: 'INVALID_REFRESH_TOKEN',
      statusCode: 401,
    });
  }

  const newRefreshToken = generateRefreshToken();
  await refreshTokenRepository.storeRefreshToken(
    user._id,
    hashRefreshToken(newRefreshToken),
  );

  const payload = {
    sub: user._id,
    roles: user.department,
    jti: generateAccessTokenId(),
  };
  const newAccessToken = signAccessToken(payload);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.auth.cookieSecure,
    sameSite: 'strict',
    maxAge: config.auth.refreshExpiresInDays * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    createSuccessResponse({
      token: newAccessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    }),
  );
};

export const signout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const accessToken = verifyAccessToken(
        authHeader.slice('Bearer '.length).trim(),
      );
      if (accessToken.jti && accessToken.exp) {
        await revokedAccessTokenRepository.revoke(
          accessToken.jti,
          new Date(accessToken.exp * 1000),
        );
      }
    } catch {
      // Logout still clears the refresh token when the access token has expired.
    }
  }

  const hashedRefreshToken = hashRefreshToken(token);
  await refreshTokenRepository.removeRefreshTokenByToken(hashedRefreshToken);
  res.clearCookie('refreshToken');
  res.status(200).json(createSuccessResponse({ message: 'Signout success' }));
};

export const validateToken = (_req: Request, res: Response) => {
  return res.status(204).json(createSuccessResponse({}));
};

const GENERIC_FORGOT_PASSWORD_MESSAGE =
  'If an account with that email exists, password reset instructions have been sent.';

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await userService.getByEmail(email);

  if (user && user.status) {
    const rawToken = generatePasswordResetToken();
    const hashedToken = hashPasswordResetToken(rawToken);

    // Invalidate any previously issued links before storing the new one.
    await passwordResetTokenRepository.removeAllForUser(user._id);
    await passwordResetTokenRepository.storeToken(
      user._id,
      hashedToken,
      getPasswordResetExpirationDate(),
    );

    await emailService.sendPasswordResetEmail(user, rawToken);
  }

  // Same response whether or not the email exists, to avoid account enumeration.
  res
    .status(200)
    .json(createSuccessResponse({ message: GENERIC_FORGOT_PASSWORD_MESSAGE }));
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const hashedToken = hashPasswordResetToken(token);
  const resetToken =
    await passwordResetTokenRepository.findActiveByToken(hashedToken);

  if (!resetToken) {
    throw new AppError({
      message: 'Invalid or expired password reset link.',
      code: 'INVALID_RESET_TOKEN',
      statusCode: 400,
    });
  }

  const user = await userService.getById(resetToken.userId);
  if (!user || !user.status) {
    throw new AppError({
      message: 'Invalid or expired password reset link.',
      code: 'INVALID_RESET_TOKEN',
      statusCode: 400,
    });
  }

  const strength = await passwordStrengthValidation(newPassword, [
    user.name,
    user.email,
  ]);

  if (strength.score < 3) {
    throw new AppError({
      message:
        strength.feedback.warning +
          ' ' +
          strength.feedback.suggestions.join(' ') ||
        'Password does not meet the required strength. Please enter another password',
      code: 'PASSWORD_POLICY',
      statusCode: 400,
    });
  }

  const salt = generateSalt();
  const hashed_password = encryptPassword({ password: newPassword, salt });

  const consumedToken =
    await passwordResetTokenRepository.consumeByToken(hashedToken);
  if (!consumedToken) {
    throw new AppError({
      message: 'Invalid or expired password reset link.',
      code: 'INVALID_RESET_TOKEN',
      statusCode: 400,
    });
  }

  await userService.updateById(user._id, {
    hashed_password,
    salt,
    mistakes: 0,
  });

  // Password changed: revoke every active session and any other pending reset links.
  await refreshTokenRepository.removeAllForUser(user._id);
  await passwordResetTokenRepository.removeAllForUser(user._id);

  auditTrailService.create({
    userId: user._id,
    action: 'Reset password via email link',
    request: req,
    payload: {},
  });

  res.status(200).json(
    createSuccessResponse({
      message:
        'Password reset successful. Please sign in with your new password.',
    }),
  );
};
