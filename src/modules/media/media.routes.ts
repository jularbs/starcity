import express from 'express';
import { getMediaSchema } from './dto/getMedia.dto.js';
const router = express.Router();
import { getMedia, uploadMediaFromEditor } from './media.controller.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import {
  ADMIN_ROLE,
  CONTENT_MANAGER_ROLE,
  ECOMMERCE_MANAGER_ROLE,
} from '../auth/auth.constants.js';
import {
  upload,
  validateUploadedFile,
} from '../../common/middleware/multer.middleware.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { UploadedImageFileSchema } from '../../common/schemas/uploadedImageFile.schema.js';

router.get('/v1/media', validateRequest({ query: getMediaSchema }), getMedia);

router.post(
  '/v1/upload/editor',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE),
  upload.single('image'),
  validateUploadedFile,
  validateRequest({ file: UploadedImageFileSchema }),
  uploadMediaFromEditor,
);

export default router;
