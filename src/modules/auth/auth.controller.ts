import User from '../user/user.model.js';
import jwt from 'jsonwebtoken';
import { createEntry } from '../auditTrail/auditTrail.controller.js';
import { config } from '../../config/index.js';
import {
  generateSalt,
  encryptPassword,
  authenticate,
} from './password.helpers.js';

export const signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return res
      .status(400)
      .json({ error: 'Password and Confirm Password should match' });

  try {
    const user = await User.findOne({ email }).exec();

    if (user) {
      return res.status(400).json({
        error:
          'Email address is already registered. Please proceed to logging in.',
      });
    }

    const salt = generateSalt();
    const hashed_password = encryptPassword({ password, salt });
    const newUser = new User({
      name,
      email,
      hashed_password,
      salt,
    });

    await newUser.save();

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

    const user = await User.findOne({ email }).exec();

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
      user.mistakes = user.mistakes + 1;
      await user.save();
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
    const token = jwt.sign(
      { _id: user._id, department: user.department, name: user.name },
      config.auth.jwtSecret,
      {
        expiresIn: `${config.auth.jwtExpiresInMinutes}m`,
      },
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    });

    user.mistakes = 0;
    user.lastLogin = new Date();

    await user.save();

    createEntry(user.name, 'Logged in to system', { email: email }, req);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: 'Unable to sign in. Please try again later.',
      message: error,
    });
  }
};

export const signout = (req, res) => {
  res.clearCookie('token');
  res.json({
    message: 'Signout success',
  });
};

export const changePassword = async (req, res) => {
  try {
    const { _id, currentPassword, newPassword, confirmation } = req.body;

    const user = await User.findOne({ _id }).exec();
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
    user.hashed_password = hashed_password;
    user.salt = salt;

    await user.save();
    createEntry(user.name, `Changed Password`, {}, req);
    return res.json({ success: 'Password successfully changed' });
  } catch {
    return res
      .status(400)
      .json({ error: 'Unable to change password. Please try again later' });
  }
};

export const validateToken = (req, res) => {
  return res.json({ message: 'VALID' });
};
