import { Request, Response } from 'express';
import slugify from 'slugify';
import { smartTrim } from '../../common/utils/smart-trim.js';
import { stripHtml } from 'string-strip-html';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import dateFnsTz from 'date-fns-tz';

import { postService } from './post.service.js';
import { Types } from 'mongoose';

const { zonedTimeToUtc } = dateFnsTz;

declare module 'express-serve-static-core' {
  interface Request {
    profile?: {
      department?: string;
      name?: string;
      _id?: string;
    };
  }
}

export const create = async (req: Request, res: Response) => {
  const { title, content, status, publishDate } = req.body;
  const imageFile = req.file;

  const slug = slugify.default(title).toLowerCase();
  const excerpt = smartTrim(
    stripHtml(content).result.substring(0, 300),
    280,
    ' ',
    '...',
  );

  const result = await postService.create({
    authorId: req.profile?._id,
    title,
    slug,
    content,
    excerpt,
    featuredImage: imageFile,
    status,
    publishDate: zonedTimeToUtc(publishDate, 'Asia/Manila'),
  });
  res.json(result);
  auditTrailService.create({
    action: 'Created new post',
    payload: result,
    request: req,
  });
};

export const read = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await postService.getBySlug(slug as string);
  res.json(result);
};

export const list = async (req: Request, res: Response) => {
  const { skip, limit } = req.query;
  const result = await postService.list({
    skip: parseInt(skip as string),
    limit: parseInt(limit as string),
  });
  const count = await postService.count();
  res.json({ data: result, count });
};

export const update = async (req: Request, res: Response) => {
  const { title, content, slug, status, publishDate } = req.body;
  const { id } = req.params;
  const imageFile = req.file;

  const excerpt = smartTrim(
    stripHtml(content).result.substring(0, 300),
    280,
    ' ',
    '...',
  );

  const updatePayload = {
    title: title,
    content: content,
    slug: slug,
    excerpt: excerpt,
    status: status,
    publishDate: zonedTimeToUtc(publishDate, 'Asia/Manila'),
    ...(imageFile && { featuredImage: imageFile }),
  };
  const result = await postService.updateById(
    id as unknown as Types.ObjectId,
    updatePayload,
  );
  res.json(result);
  auditTrailService.create({
    action: `Updated post ${id}`,
    payload: result,
    request: req,
  });
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  await postService.deleteById(id as unknown as Types.ObjectId);

  res.json({ message: 'Post deleted successfully' });
  auditTrailService.create({
    action: `Deleted post ${id}`,
    payload: {},
    request: req,
  });
};
