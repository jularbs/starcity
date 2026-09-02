import express from "express";
const router = express.Router();
import { getMedia, uploadMediaFromEditor } from "./media.controller.js";
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
router.get("/v1/media", getMedia);

router.post("/v1/upload/editor", requireSignin, authzMiddleware("admin"), uploadMediaFromEditor);

export default router;