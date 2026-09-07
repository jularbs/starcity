import { createEntry } from '../auditTrail/auditTrail.controller.js';
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

export const signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return res
      .status(400)
      .json({ error: 'Password and Confirm Password should match' });

  try {
    const user = await userService.getByEmail(email);

    if (user) {
      return res.status(400).json({
        error:
          'Email address is already registered. Please proceed to logging in.',
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

    return res.json({
      success: 'Signup Success! Please wait for your acccount to be processed.',
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: 'Unable to signup new user.',
      message: error,
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getByEmail(email);

    if (!user) {
      return res.status(400).json({
        error: 'Email is not yet registered. Please create an account.',
      });
    }

    if (user.mistakes > 3) {
      return res.status(400).json({
        error:
          'Your account has been blocked due to many failed attempts to sign in. Please contact web administrator',
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

      return res.status(400).json({
        error: 'Email and password do not match.',
      });
    }

    if (!user.status) {
      return res.status(400).json({
        error: 'Account is not yet approved.',
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

    await refreshTokenRepository.storeRefreshToken(
      user._id,
      hashedRefreshToken,
    );

    res.cookie('token', refreshToken, {
      httpOnly: true,
      secure: config.auth.cookieSecure,
      sameSite: 'Strict',
      maxAge: config.auth.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    });

    await userService.updateById(user._id, {
      mistakes: 0,
      lastLogin: new Date(),
    });

    createEntry(user.name, 'Logged in to system', { email: email }, req);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: 'Unable to sign in. Please try again later.',
      message: error,
    });
  }
};

export const signout = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({
      error: 'No token provided.',
    });
  }

  const hashedRefreshToken = hashRefreshToken(token);
  await refreshTokenRepository.removeRefreshTokenByToken(hashedRefreshToken);
  res.clearCookie('token');
  res.json({
    message: 'Signout success',
  });
};

export const changePassword = async (req, res) => {
  try {
    const { _id, currentPassword, newPassword, confirmation } = req.body;

    const user = await userService.getById(_id);
    if (
      !authenticate({
        password: currentPassword,
        salt: user.salt,
        hashedPassword: user.hashed_password,
      })
    ) {
      return res.status(400).json({
        error: 'Current password is incorrect.',
      });
    }

    if (newPassword !== confirmation) {
      return res.status(400).json({
        error: 'New Password and confirmation should match',
      });
    }

    const salt = generateSalt();
    const hashed_password = encryptPassword({ password: confirmation, salt });
    await userService.updateById(user._id, {
      hashed_password,
      salt,
    });
    createEntry(user.name, `Changed Password`, {}, req);
    return res.json({ success: 'Password successfully changed' });
  } catch {
    return res
      .status(400)
      .json({ error: 'Unable to change password. Please try again later' });
  }
};

export const validateToken = (_req, res) => {
  return res.json({ message: 'VALID' });
};
