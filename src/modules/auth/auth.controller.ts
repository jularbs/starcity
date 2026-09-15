import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../common/utils/success-response.js';
import {
  generateSalt,
  encryptPassword,
  authenticate,
} from './password.helpers.js';
import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
} from './token.helpers.js';
import { config } from '../../config/index.js';
import { refreshTokenRepository } from './refreshToken.repository.js';
import { userService } from '../user/user.service.js';
import { AppError } from '../../common/errors/app-error.js';

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const user = await userService.getByEmail(email);

  if (user) {
    throw new AppError({
      message:
        'Email address is already registered. Please proceed to logging in.',
      code: 'EXISTING_EMAIL',
      statusCode: 400,
    });
  }

  const salt = generateSalt();
  const hashed_password = encryptPassword({ password, salt });
  await userService.create({
    name,
    email,
    hashed_password,
    salt,
  });

  return res.status(201).json(
    createSuccessResponse({
      message: 'Signup Success! Please wait for your account to be processed.',
    }),
  );
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userService.getByEmail(email);

  if (!user) {
    throw new AppError({
      message: 'Email is not yet registered. Please create an account.',
      code: 'EMAIL_NOT_REGISTERED',
      statusCode: 400,
    });
  }

  if (user.mistakes > 3) {
    throw new AppError({
      message:
        'Your account has been blocked due to many failed attempts to sign in. Please contact web administrator',
      code: 'ACCOUNT_BLOCKED',
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
      message: 'Account not yet approved',
      code: 'ACCOUNT_PENDING',
      statusCode: 400,
    });
  }

  //generate JWT
  const payload = {
    _id: user._id,
    department: user.department,
    name: user.name,
  };
  const token = signAccessToken(payload);

  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  // Store hashed refresh token in the database

  await refreshTokenRepository.storeRefreshToken(user._id, hashedRefreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.auth.cookieSecure,
    sameSite: 'strict',
    maxAge: config.auth.refreshExpiresInDays * 24 * 60 * 60 * 1000,
  });

  userService.updateById(user._id, {
    mistakes: 0,
    lastLogin: new Date(),
  });

  auditTrailService.create({
    user: user.name,
    action: 'Logged in to system',
    request: req,
    payload: { email: email },
  });

  res.status(200).json(
    createSuccessResponse({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    }),
  );
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
  const storedToken =
    await refreshTokenRepository.findByToken(hashedRefreshToken);

  if (!storedToken || storedToken.expiresAt < new Date()) {
    res.clearCookie('refreshToken');
    throw new AppError({
      message: 'Invalid or expired refresh token.',
      code: 'INVALID_REFRESH_TOKEN',
      statusCode: 401,
    });
  }

  const user = await userService.getById(storedToken.userId);
  if (!user || !user.status) {
    await refreshTokenRepository.removeRefreshTokenByToken(hashedRefreshToken);
    res.clearCookie('refreshToken');
    throw new AppError({
      message: 'Invalid or expired refresh token.',
      code: 'INVALID_REFRESH_TOKEN',
      statusCode: 401,
    });
  }

  // rotate refresh token so a stolen token can only be replayed once
  await refreshTokenRepository.removeRefreshTokenByToken(hashedRefreshToken);
  const newRefreshToken = generateRefreshToken();
  await refreshTokenRepository.storeRefreshToken(
    user._id,
    hashRefreshToken(newRefreshToken),
  );

  const payload = {
    _id: user._id,
    department: user.department,
    name: user.name,
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

  const hashedRefreshToken = hashRefreshToken(token);
  await refreshTokenRepository.removeRefreshTokenByToken(hashedRefreshToken);
  res.clearCookie('refreshToken');
  res.status(200).json(createSuccessResponse({ message: 'Signout success' }));
};

export const validateToken = (_req: Request, res: Response) => {
  return res.status(204).json(createSuccessResponse({}));
};
