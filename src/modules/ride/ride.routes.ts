import express from 'express';
const router = express.Router();
import {
  create,
  read,
  list,
  update,
  remove,
  readByRideCategoryId,
} from './ride.controller.js';
import { updateRideSchema } from './dto/updateRide.dto.js';
import { validateRequest } from '../../common/middleware/validate-request.middleware.js';
import { rideIdParamsSchema } from './dto/rideIdParams.dto.js';
import { rideSlugParamsSchema } from './dto/rideSlugParams.dto.js';
import { createRideSchema } from './dto/createRide.dto.js';
import {
  requireSignin,
  authzMiddleware,
} from '../../common/middleware/auth.middleware.js';
import {
  upload,
  validateUploadedFile,
} from '../../common/middleware/multer.middleware.js';
import { ADMIN_ROLE, CONTENT_MANAGER_ROLE } from '../auth/auth.constants.js';
import { UploadedImageFileSchema } from '../../common/schemas/uploadedImageFile.schema.js';

router.post(
  '/v1/ride',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  upload.single('image'),
  validateUploadedFile,
  validateRequest({ body: createRideSchema, file: UploadedImageFileSchema }),
  create,
);

router.patch(
  '/v1/ride/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  upload.single('image'),
  validateUploadedFile,
  validateRequest({
    body: updateRideSchema,
    file: UploadedImageFileSchema.optional(),
  }),
  update,
);

router.get('/v1/ride', list);

router.get(
  '/v1/ride/category/:id',
  validateRequest({ params: rideIdParamsSchema }),
  readByRideCategoryId,
);

router.get(
  '/v1/ride/:slug',
  validateRequest({ params: rideSlugParamsSchema }),
  read,
);

router.delete(
  '/v1/ride/:id',
  requireSignin,
  authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE),
  validateRequest({ params: rideIdParamsSchema }),
  remove,
);

export default router;
