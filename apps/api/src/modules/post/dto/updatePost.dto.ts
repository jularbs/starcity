import { z } from 'zod';

export const updatePostSchema = z
  .object({
    title: z.string().min(1, 'Title is required').optional(),
    slug: z.string().min(1, 'Slug is required').optional(),
    content: z.string().min(1, 'Content is required').optional(),
    status: z.enum(['draft', 'published']).default('draft').optional(),
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
