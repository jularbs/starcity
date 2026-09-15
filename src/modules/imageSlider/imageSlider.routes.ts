import express from 'express';
const router = express.Router();
import {
  create,
  list,
  update,
  remove,
  read,
} from './imageSlider.controller.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import {
  upload,
  validateUploadedFile,
} from '../../common/middleware/multer.middleware.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { UploadedImageFileSchema } from '../../common/schemas/uploadedImageFile.schema.js';
import { ADMIN_ROLE, CONTENT_MANAGER_ROLE } from '../auth/auth.constants.js';
import { createImageSliderSchema } from './dto/createImageSlider.dto.js';
import { updateImageSliderSchema } from './dto/updateImageSlider.dto.js';
import { imageSliderIdParamsSchema } from './dto/imageSliderIdParams.dto.js';

router.post(
  '/v1/image-slider',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  upload.single('image'),
  validateUploadedFile,
  validateRequest({
    body: createImageSliderSchema,
    file: UploadedImageFileSchema,
  }),
  create,
);

router.patch(
  '/v1/image-slider/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  upload.single('image'),
  validateUploadedFile,
  validateRequest({
    params: imageSliderIdParamsSchema,
    file: UploadedImageFileSchema.optional(),
    body: updateImageSliderSchema,
  }),
  update,
);

//TODOS: pagination validation
router.get('/v1/image-slider', list);

router.get(
  '/v1/image-slider/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  validateRequest({
    params: imageSliderIdParamsSchema,
  }),
  read,
);

router.delete(
  '/v1/image-slider/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  validateRequest({
    params: imageSliderIdParamsSchema,
  }),
  remove,
);

export default router;
