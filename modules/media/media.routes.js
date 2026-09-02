import express from "express";
const router = express.Router();
import { getMedia, uploadMediaFromEditor } from "./media.controller.js";
import { requireSignin, authMiddleware } from "../auth/auth.controller.js";
router.get("/v1/media", getMedia);

router.post("/v1/upload/editor", requireSignin, authMiddleware, uploadMediaFromEditor);

export default router;