import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import { AppError } from '../../common/errors/app-error.js';
import type { AuthenticatedRequest } from '../../common/types/request.types.js';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import {
  authenticate,
  encryptPassword,
  generateSalt,
  passwordStrengthValidation,
} from '../auth/password.helpers.js';
import { userService } from './user.service.js';
import { createSuccessResponse } from '../../common/utils/success-response.js';
import { refreshTokenRepository } from '../auth/refreshToken.repository.js';
import { mfaService } from '../auth/mfa.service.js';

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await userService.getById(id as unknown as Types.ObjectId);

  if (!user) {
    throw new AppError({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
      statusCode: 404,
    });
  }

  await userService.removeById(id as unknown as Types.ObjectId);

  return res.status(200).json(createSuccessResponse({}));
};

export const read = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await userService.getById(id as unknown as Types.ObjectId);
  if (!user) {
    throw new AppError({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
      statusCode: 404,
    });
  }

  const mfaEnabledAt = user.mfaEnabledAt;
  const recoveryCodesRemaining = user.mfaRecoveryCodeHashes?.length ?? 0;
  const userData = user.toObject();
  delete userData.hashed_password;
  delete userData.salt;
  delete userData.mfaSecret;
  delete userData.mfaPendingSecret;
  delete userData.mfaPendingExpiresAt;
  delete userData.mfaRecoveryCodeHashes;
  delete userData.mfaLastTotpStep;
  return res.status(200).json(
    createSuccessResponse({
      ...userData,
      mfaEnabledAt,
      recoveryCodesRemaining,
    }),
  );
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status, email, department } = req.body;

  const update = {
    ...(name && { name }),
    ...(status && { status }),
    ...(email && { email }),
    ...(department && { department }),
  };

  const result = await userService.updateById(
    id as unknown as Types.ObjectId,
    update,
  );
  const userData = result?.toObject();
  if (userData) {
    delete userData.hashed_password;
    delete userData.salt;
    delete userData.mfaSecret;
    delete userData.mfaPendingSecret;
    delete userData.mfaPendingExpiresAt;
    delete userData.mfaRecoveryCodeHashes;
    delete userData.mfaLastTotpStep;
  }
  return res.status(200).json(createSuccessResponse(userData ?? result));
};

export const list = async (req: Request, res: Response) => {
  const {
    query = '',
    department = '',
    skip = 0,
    limit = 0,
    status = false,
  } = req.query;

  const params = {
    query,
    department,
    status,
  };

  const users = await userService.list({
    params,
    skip: parseInt(skip as string),
    limit: parseInt(limit as string),
  });
  const count = await userService.countUsers(params);

  return res.status(200).json(
    createSuccessResponse(users, {
      count,
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
      query,
      department,
      status,
    }),
  );
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { currentPassword, newPassword } = req.body;

  const _id = req.profile?.sub;
  const user = await userService.getById(_id as unknown as Types.ObjectId);

  if (!user) {
    throw new AppError({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
      statusCode: 404,
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

  if (
    !authenticate({
      password: currentPassword,
      salt: user.salt,
      hashedPassword: user.hashed_password,
    })
  ) {
    throw new AppError({
      message: 'Current password is incorrect',
      code: 'CURRENT_PASSWORD_INCORRECT',
      statusCode: 400,
    });
  }

  const salt = generateSalt();
  const hashed_password = encryptPassword({ password: newPassword, salt });
  await userService.updateById(user._id as unknown as Types.ObjectId, {
    hashed_password,
    salt,
  });
  auditTrailService.create({
    userId: user._id,
    action: 'Changed Password',
    request: req,
    payload: {},
  });
  return res.status(200).json(createSuccessResponse({}));
};

export const unblockUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await userService.getById(id as unknown as Types.ObjectId);
  if (!user) {
    throw new AppError({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
      statusCode: 400,
    });
  }

  await userService.updateById(id as unknown as Types.ObjectId, {
    mistakes: 0,
  });

  auditTrailService.create({
    userId: user._id,
    action: 'Unblocked User',
    request: req,
    payload: {},
  });
  return res.status(200).json(createSuccessResponse({}));
};

export const adminResetMfa = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id } = req.params;
  const target = await userService.getById(id as unknown as Types.ObjectId);
  if (!target) {
    throw new AppError({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
      statusCode: 404,
    });
  }
  if (req.profile?.sub === target._id.toString()) {
    throw new AppError({
      message: 'Use account recovery instead of resetting your own MFA',
      code: 'MFA_SELF_RESET_NOT_ALLOWED',
      statusCode: 400,
    });
  }
  if (!target.mfaEnabledAt && !target.mfaPendingSecret) {
    throw new AppError({
      message: 'User does not have MFA configured',
      code: 'MFA_NOT_ENABLED',
      statusCode: 409,
    });
  }

  await userService.updateById(target._id, {
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
    refreshTokenRepository.removeAllForUser(target._id),
    mfaService.removeLoginChallengesForUser(target._id),
  ]);
  await auditTrailService.create({
    action: 'Admin reset user MFA',
    request: req,
    payload: {
      targetUserId: target._id.toString(),
      targetEmail: target.email,
      reason: req.body.reason,
    },
  });

  return res.status(200).json(createSuccessResponse({}));
};
