import express from 'express';
import { createPostSchema } from './dto/createPost.dto.js';
import { postIdParamsSchema } from './dto/postIdParams.dto.js';
import { postSlugParamsSchema } from './dto/postSlugParams.dto.js';
import { listPostSchema } from './dto/listPost.dto.js';
const router = express.Router();
import { create, read, list, update, remove } from './post.controller.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import {
  ADMIN_ROLE,
  ECOMMERCE_MANAGER_ROLE,
  CONTENT_MANAGER_ROLE,
} from '../auth/auth.constants.js';
import {
  upload,
  validateUploadedFile,
} from '../../common/middleware/multer.middleware.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { UploadedImageFileSchema } from '../../common/schemas/uploadedImageFile.schema.js';

router.post(
  '/v1/post',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE, CONTENT_MANAGER_ROLE),
  upload.single('image'),
  validateUploadedFile,
  validateRequest({
    file: UploadedImageFileSchema,
    body: createPostSchema,
  }),
  create,
);

router.patch(
  '/v1/post/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE, CONTENT_MANAGER_ROLE),
  upload.single('image'),
  validateUploadedFile,
  validateRequest({
    file: UploadedImageFileSchema.optional(),
    params: postIdParamsSchema,
  }),
  update,
);

router.get('/v1/post', validateRequest({ query: listPostSchema }), list);

router.get(
  '/v1/post/:slug',
  validateRequest({ params: postSlugParamsSchema }),
  read,
);

router.delete(
  '/v1/post/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, ECOMMERCE_MANAGER_ROLE, CONTENT_MANAGER_ROLE),
  validateRequest({
    params: postIdParamsSchema,
  }),
  remove,
);

export default router;
