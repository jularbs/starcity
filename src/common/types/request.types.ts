import type { Request } from 'express';
import type { Types } from 'mongoose';

export type AuthenticatedRequest = Request & {
  profile?: {
    department?: string;
    name?: string;
    _id?: Types.ObjectId;
  };
};
