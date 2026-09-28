import { z } from 'zod';
import escapeHtml from 'escape-html';

export const createPostSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .transform((val) => escapeHtml(val)),
    content: z.string().min(1, 'Content is required'),
    status: z.enum(['draft', 'published']).default('draft'),
    publishDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'published' && !data.publishDate) {
        return false;
      }
      return true;
    },
    {
      message: 'Publish date is required when status is published',
      path: ['publishDate'],
    },
  );
