import { z } from 'zod';

export const BooleanSchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');
