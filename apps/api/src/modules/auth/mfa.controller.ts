import type { Response } from 'express';
import { Types } from 'mongoose';
import * as OTPAuth from 'otpauth';
import type { AuthenticatedRequest } from '../../common/types/request.types.js';
import { AppError } from '../../common/errors/app-error.js';
import { createSuccessResponse } from '../../common/utils/success-response.js';
import { config } from '../../config/index.js';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import { refreshTokenRepository } from './refreshToken.repository.js';
import { userService } from '../user/user.service.js';
import { authenticate } from './password.helpers.js';
import {
  createRecoveryCodes,
  createTotpQrCode,
  decryptMfaSecret,
  encryptMfaSecret,
  hashRecoveryCode,
  verifyTotp,
} from './mfa.helpers.js';
import { mfaService } from './mfa.service.js';

const getAuthenticatedUser = async (req: AuthenticatedRequest) => {
  const userId = req.profile?.sub;
  const user = userId
    ? await userService.getById(userId as unknown as Types.ObjectId)
    : null;

  if (!user || !user.status) {
    throw new AppError({
      message: 'Authenticated user not found',
      code: 'USER_NOT_FOUND',
      statusCode: 401,
    });
  }

  return user;
};

export const getMfaStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const user = await getAuthenticatedUser(req);
  return res.status(200).json(
    createSuccessResponse({
      enabled: Boolean(user.mfaEnabledAt),
      enabledAt: user.mfaEnabledAt ?? null,
      recoveryCodesRemaining: user.mfaRecoveryCodeHashes?.length ?? 0,
    }),
  );
};

export const beginMfaSetup = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const user = await getAuthenticatedUser(req);
  const { currentPassword } = req.body;
  if (!authenticateUserPassword(user, currentPassword)) {
    throw new AppError({
      message: 'Current password is incorrect',
      code: 'CURRENT_PASSWORD_INCORRECT',
      statusCode: 400,
    });
  }
  if (user.mfaEnabledAt) {
    throw new AppError({
      message: 'MFA is already enabled',
      code: 'MFA_ALREADY_ENABLED',
      statusCode: 409,
    });
  }

  const secret = new OTPAuth.Secret({ size: 20 });
  const encryptedSecret = encryptMfaSecret(secret.base32);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await userService.updateById(user._id, {
    mfaPendingSecret: encryptedSecret,
    mfaPendingExpiresAt: expiresAt,
  });

  const totp = new OTPAuth.TOTP({
    issuer: config.app.name,
    label: user.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  return res.status(200).json(
    createSuccessResponse({
      qrCode: await createTotpQrCode(totp.toString()),
      manualEntryKey: secret.base32,
      expiresAt,
    }),
  );
};

export const confirmMfaSetup = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const user = await getAuthenticatedUser(req);
  if (
    user.mfaEnabledAt ||
    !user.mfaPendingSecret ||
    !user.mfaPendingExpiresAt ||
    user.mfaPendingExpiresAt <= new Date()
  ) {
    throw new AppError({
      message: 'MFA setup has expired. Start setup again.',
      code: 'MFA_SETUP_EXPIRED',
      statusCode: 400,
    });
  }

  const base32Secret = decryptMfaSecret(user.mfaPendingSecret);
  const step = verifyTotp(user.email, base32Secret, req.body.code);
  if (step === null) {
    throw new AppError({
      message: 'Verification code is invalid',
      code: 'INVALID_MFA_CODE',
      statusCode: 400,
    });
  }

  const recoveryCodes = createRecoveryCodes();
  await userService.updateById(user._id, {
    $set: {
      mfaSecret: user.mfaPendingSecret,
      mfaEnabledAt: new Date(),
      mfaRecoveryCodeHashes: recoveryCodes.map(hashRecoveryCode),
      mfaLastTotpStep: step,
    },
    $unset: { mfaPendingSecret: 1, mfaPendingExpiresAt: 1 },
  });

  await auditTrailService.create({
    userId: user._id,
    action: 'Enabled MFA',
    request: req,
    payload: {},
  });

  return res.status(200).json(createSuccessResponse({ recoveryCodes }));
};

export const disableMfa = async (req: AuthenticatedRequest, res: Response) => {
  const user = await getAuthenticatedUser(req);
  const { currentPassword, code } = req.body;
  if (!user.mfaEnabledAt || !user.mfaSecret) {
    throw new AppError({
      message: 'MFA is not enabled',
      code: 'MFA_NOT_ENABLED',
      statusCode: 409,
    });
  }
  if (!authenticateUserPassword(user, currentPassword)) {
    throw new AppError({
      message: 'Current password is incorrect',
      code: 'CURRENT_PASSWORD_INCORRECT',
      statusCode: 400,
    });
  }
  const factor = await mfaService.verifyUserFactor(user, code, true);
  if (!factor) {
    throw new AppError({
      message: 'Verification code is invalid',
      code: 'INVALID_MFA_CODE',
      statusCode: 400,
    });
  }

  await userService.updateById(user._id, {
    $unset: {
      mfaSecret: 1,
      mfaPendingSecret: 1,
      mfaPendingExpiresAt: 1,
      mfaEnabledAt: 1,
      mfaLastTotpStep: 1,
    },
    $set: { mfaRecoveryCodeHashes: [] },
  });
  await Promise.all([
    refreshTokenRepository.removeAllForUser(user._id),
    mfaService.removeLoginChallengesForUser(user._id),
  ]);
  await auditTrailService.create({
    userId: user._id,
    action: 'Disabled MFA',
    request: req,
    payload: { usedRecoveryCode: factor === 'recovery' },
  });

  res.clearCookie('refreshToken');
  return res.status(200).json(createSuccessResponse({}));
};

export const regenerateRecoveryCodes = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const user = await getAuthenticatedUser(req);
  const { currentPassword, code } = req.body;
  if (!user.mfaEnabledAt || !user.mfaSecret) {
    throw new AppError({
      message: 'MFA is not enabled',
      code: 'MFA_NOT_ENABLED',
      statusCode: 409,
    });
  }
  if (!authenticateUserPassword(user, currentPassword)) {
    throw new AppError({
      message: 'Current password is incorrect',
      code: 'CURRENT_PASSWORD_INCORRECT',
      statusCode: 400,
    });
  }
  const factor = await mfaService.verifyUserFactor(user, code, false);
  if (factor !== 'totp') {
    throw new AppError({
      message: 'Verification code is invalid',
      code: 'INVALID_MFA_CODE',
      statusCode: 400,
    });
  }

  const recoveryCodes = createRecoveryCodes();
  await userService.updateById(user._id, {
    mfaRecoveryCodeHashes: recoveryCodes.map(hashRecoveryCode),
  });
  await auditTrailService.create({
    userId: user._id,
    action: 'Regenerated MFA recovery codes',
    request: req,
    payload: {},
  });

  return res.status(200).json(createSuccessResponse({ recoveryCodes }));
};

const authenticateUserPassword = (user, password: string) => {
  return authenticate({
    password,
    salt: user.salt,
    hashedPassword: user.hashed_password,
  });
};
