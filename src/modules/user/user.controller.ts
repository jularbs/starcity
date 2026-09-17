import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import { AppError } from '../../common/errors/app-error.js';
import type { AuthenticatedRequest } from '../../common/types/request.types.js';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import {
  authenticate,
  encryptPassword,
  generateSalt,
} from '../auth/password.helpers.js';
import { userService } from './user.service.js';
import { createSuccessResponse } from '../../common/utils/success-response.js';

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

  delete user.hashed_password;
  delete user.salt;
  return res.status(200).json(createSuccessResponse(user));
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
  return res.status(200).json(createSuccessResponse(result));
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

  const _id = req.profile?._id;
  const user = await userService.getById(_id as unknown as Types.ObjectId);
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
    user: user.name,
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
    user: user.name,
    action: 'Unblocked User',
    request: req,
    payload: {},
  });
  return res.status(200).json(createSuccessResponse({}));
};
