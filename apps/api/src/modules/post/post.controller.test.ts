import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from './post.controller.js';
import postRoutes from './post.routes.js';
import { postService } from './post.service.js';
import { createPostSchema } from './dto/createPost.dto.js';

vi.mock('./post.service.js', () => ({
  postService: { create: vi.fn(), updateById: vi.fn() },
}));
vi.mock('../auditTrail/auditTrail.service.js', () => ({
  auditTrailService: { create: vi.fn() },
}));
vi.mock('../../common/middleware/auth.middleware.js', () => ({
  requireSignin: (_req: Request, _res: Response, next: NextFunction) => next(),
  authzMiddleware: () => (_req: Request, _res: Response, next: NextFunction) =>
    next(),
}));
vi.mock('../../common/middleware/rate-limit.middleware.js', () => ({
  createRateLimiter:
    () => (_req: Request, _res: Response, next: NextFunction) =>
      next(),
}));
vi.mock('../../common/middleware/multer.middleware.js', () => ({
  upload: {
    single: () => (_req: Request, _res: Response, next: NextFunction) => next(),
  },
  validateUploadedFile: (_req: Request, _res: Response, next: NextFunction) =>
    next(),
}));

describe('post publish date handling', () => {
  const postId = '507f1f77bcf86cd799439011';
  const app = express();
  app.use(express.json());
  app.use('/api', postRoutes);
  app.use(
    (
      error: { statusCode?: number; code?: string },
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      res.status(error.statusCode ?? 500).json({ code: error.code });
    },
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(postService.updateById).mockResolvedValue({
      _id: postId,
    } as never);
    vi.mocked(postService.create).mockResolvedValue({ _id: postId } as never);
  });

  it('omits the date and status from a title-only update', async () => {
    const response = await request(app)
      .patch(`/api/v1/post/${postId}`)
      .send({ title: 'Updated title' });

    expect(response.status).toBe(200);
    const payload = vi.mocked(postService.updateById).mock.calls[0][1];
    expect(payload).toHaveProperty('title', 'Updated title');
    expect(payload).not.toHaveProperty('publishDate');
    expect(payload).not.toHaveProperty('status');
  });

  it('allows a draft update without a publish date', async () => {
    const response = await request(app)
      .patch(`/api/v1/post/${postId}`)
      .send({ status: 'draft' });

    expect(response.status).toBe(200);
    const payload = vi.mocked(postService.updateById).mock.calls[0][1];
    expect(payload).toHaveProperty('status', 'draft');
    expect(payload).not.toHaveProperty('publishDate');
  });

  it('passes a valid supplied date to the update service', async () => {
    const response = await request(app)
      .patch(`/api/v1/post/${postId}`)
      .send({ status: 'published', publishDate: '2026-10-21T12:00:00' });

    expect(response.status).toBe(200);
    const payload = vi.mocked(postService.updateById).mock.calls[0][1];
    expect(payload.publishDate).toBeInstanceOf(Date);
    expect(Number.isNaN(payload.publishDate?.getTime())).toBe(false);
  });

  it.each(['', 'not-a-date'])(
    'rejects invalid publishDate %j before updating',
    async (publishDate) => {
      const response = await request(app)
        .patch(`/api/v1/post/${postId}`)
        .send({ publishDate });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(postService.updateById).not.toHaveBeenCalled();
    },
  );

  it('requires a date when explicitly publishing', async () => {
    const response = await request(app)
      .patch(`/api/v1/post/${postId}`)
      .send({ status: 'published' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(postService.updateById).not.toHaveBeenCalled();
  });

  it('creates a draft without passing an invalid publish date', async () => {
    const body = createPostSchema.parse({
      title: 'Draft post',
      content: '<p>Draft</p>',
    });
    const response = { status: vi.fn(), json: vi.fn() };
    response.status.mockReturnValue(response);

    await create(
      { body, profile: { sub: postId } } as never,
      response as never,
    );

    expect(postService.create).toHaveBeenCalledTimes(1);
    expect(vi.mocked(postService.create).mock.calls[0][0]).not.toHaveProperty(
      'publishDate',
    );
    expect(response.status).toHaveBeenCalledWith(201);
  });
});
