import { auditTrailService } from './auditTrail.service.js';
import type { Request, Response } from 'express';

export const list = async (req: Request, res: Response) => {
  const { skip = 0, limit = 0 } = req.query;

  try {
    const auditTrails = await auditTrailService.list({
      skip: parseInt(skip as string, 10),
      limit: parseInt(limit as string, 10),
    });

    const count = await auditTrailService.count({});
    return res.json({ data: auditTrails, count });
  } catch (err) {
    console.log('Audit Error: ', err);
    return res.status(400).json({
      error: 'Error occured',
    });
  }
};
