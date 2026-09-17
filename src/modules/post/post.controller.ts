import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../common/types/request.types.js';
import slugify from 'slugify';
import { smartTrim } from '../../common/utils/smart-trim.js';
import { stripHtml } from 'string-strip-html';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import dateFnsTz from 'date-fns-tz';

import { postService } from './post.service.js';
import { Types } from 'mongoose';
import { createSuccessResponse } from '../../common/utils/success-response.js';

const { zonedTimeToUtc } = dateFnsTz;

export const create = async (req: AuthenticatedRequest, res: Response) => {
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
  auditTrailService.create({
    action: 'Created new post',
    payload: result,
    request: req,
  });
  res.status(201).json(createSuccessResponse(result));
};

export const read = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await postService.getBySlug(slug as string);
  res.status(200).json(createSuccessResponse(result));
};

export const list = async (req: Request, res: Response) => {
  const { skip, limit } = req.query;
  const result = await postService.list({
    skip: parseInt(skip as string),
    limit: parseInt(limit as string),
  });
  const count = await postService.count();
  res.status(200).json(
    createSuccessResponse(result, {
      count: count,
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
    }),
  );
};

export const update = async (req: Request, res: Response) => {
  const { title, content, slug, status, publishDate } = req.body;
  const { id } = req.params;
  const imageFile = req.file;

  let excerpt: string | undefined;
  if (content) {
    excerpt = smartTrim(
      stripHtml(content).result.substring(0, 300),
      280,
      ' ',
      '...',
    );
  }

  const updatePayload = {
    title: title,
    content: content,
    slug: slug,
    ...(excerpt && { excerpt }),
    status: status,
    publishDate: zonedTimeToUtc(publishDate, 'Asia/Manila'),
    ...(imageFile && { featuredImage: imageFile }),
  };
  const result = await postService.updateById(
    id as unknown as Types.ObjectId,
    updatePayload,
  );
  auditTrailService.create({
    action: `Updated post ${id}`,
    payload: result,
    request: req,
  });
  res.status(200).json(createSuccessResponse(result));
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  await postService.deleteById(id as unknown as Types.ObjectId);

  auditTrailService.create({
    action: `Deleted post ${id}`,
    payload: {},
    request: req,
  });
  res.status(200).json(createSuccessResponse({}));
};
