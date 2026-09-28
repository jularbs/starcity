import type { Request } from 'express';

export type AuthenticatedRequest = Request & {
  profile?: {
    sub?: string;
    roles?: string;
  };
};
