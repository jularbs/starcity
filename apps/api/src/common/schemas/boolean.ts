import { z } from 'zod';

export const BooleanSchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) =>
    typeof value === 'boolean' ? value : value === 'true',
  );
