import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';

export const requireSignin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : null;

  if (token) {
    jwt.verify(token, config.auth.jwtSecret, async (err, decoded) => {
      //Handle Errors
      if (err) {
        if (err.name === 'TokenExpiredError')
          return res.status(401).json({ error: 'Authentication Expired' });

        if (err.name === 'JsonWebTokenError')
          return res.status(401).json({ error: 'Invalid Authentication' });

        if (err.name === 'NotBeforeError')
          return res.status(401).json({ error: 'Invalid Authentication' });
      } else {
        //proceed
        req.profile = decoded;
        next();
      }
    });
  } else {
    return res
      .status(401)
      .json({ error: 'Auth token required for this request' });
  }
};

export const authzMiddleware =
  (...department) =>
  async (req, res, next) => {
    const userRole = req.profile?.department;

    if (!userRole || (department.length && !department.includes(userRole))) {
      return res
        .status(403)
        .json({ error: "You don't have permission to make this request" });
    }

    next();
  };
