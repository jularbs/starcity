import { Request, Response } from 'express';
import slugify from 'slugify';
import { smartTrim } from '../../common/utils/smart-trim.js';
import { stripHtml } from 'string-strip-html';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import dateFnsTz from 'date-fns-tz';

import { postService } from './post.service.js';

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

  try {
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
  } catch (err) {
    console.log('Error creating post: ', err);
    return res.status(400).json({
      error: 'Failed to save post. Please try again later.',
    });
  }
};

export const read = async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const result = await postService.getBySlug(slug as string);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: 'Error occurred while fetching the post.',
      message: err,
    });
  }
};

export const list = async (req: Request, res: Response) => {
  const { skip, limit } = req.query;
  try {
    const result = await postService.list({
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
    });
    const count = await postService.count();
    res.json({ data: result, count });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

export const update = async (req: Request, res: Response) => {
  const { title, content, slug, status, publishDate } = req.body;
  const imageFile = req.file;

  const post = await postService.getBySlug(slug as string);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const excerpt = smartTrim(
    stripHtml(content).result.substring(0, 300),
    280,
    ' ',
    '...',
  );

  try {
    const updatePayload = {
      title: title,
      content: content,
      slug: slug,
      excerpt: excerpt,
      status: status,
      publishDate: zonedTimeToUtc(publishDate, 'Asia/Manila'),
      ...(imageFile && { featuredImage: imageFile }),
    };
    const result = await postService.updateById(post._id, updatePayload);
    res.json(result);
    auditTrailService.create({
      action: `Updated post ${post.title}`,
      payload: result,
      request: req,
    });
  } catch (err) {
    return res.status(400).json({
      error: 'Error on updating post. Please try again later.',
      payload: err,
    });
  }
};

export const remove = async (req: Request, res: Response) => {
  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({
      error: 'Post slug is required',
    });
  }

  const post = await postService.getBySlug(slug as string);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  await postService.deleteById(post._id);

  res.json({ message: 'Post deleted successfully' });
  auditTrailService.create({
    action: `Deleted post ${slug}`,
    payload: {},
    request: req,
  });
};
