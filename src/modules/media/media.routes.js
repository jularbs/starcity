import express from "express";
const router = express.Router();
import { getMedia, uploadMediaFromEditor } from "./media.controller.js";
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
import { ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE } from "../auth/auth.constants.js";
router.get("/v1/media", getMedia);

router.post("/v1/upload/editor",
    requireSignin,
    authzMiddleware(ADMIN_ROLE, CONTENT_MANAGER_ROLE, ECOMMERCE_MANAGER_ROLE),
    uploadMediaFromEditor
);

export default router;