import { auditTrailService } from './auditTrail.service.js';
import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../common/utils/success-response.js';
export const list = async (req: Request, res: Response) => {
  const { skip = 0, limit = 0 } = req.query;

  const auditTrails = await auditTrailService.list({
    skip: parseInt(skip as string, 10),
    limit: parseInt(limit as string, 10),
  });

  const count = await auditTrailService.count({});
  return res.json(createSuccessResponse(auditTrails, { count, skip, limit }));
};
