import { z } from 'zod';

const MAX_IMAGE_SIZE = 3_000_000; // 3MB
const ALLOWED_IMAGE_TYPES = [
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/webp',
] as const;

export const UploadedImageFileSchema = z
  .object(
    {
      mimetype: z.enum(ALLOWED_IMAGE_TYPES, {
        message: `Unsupported file type. Accepted types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      }),
      size: z.number().max(MAX_IMAGE_SIZE, {
        message: `Image too large. ( > ${MAX_IMAGE_SIZE / 1_000_000}MB ).`,
      }),
    },
    { error: 'Image is required' },
  )
  .loose();
