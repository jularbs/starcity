const express = require("express");
const router = express.Router();
const { getMedia, uploadMediaFromEditor } = require("./media.controller");
const { requireSignin, authMiddleware } = require("../auth/auth.controller");

router.get("/v1/media", getMedia);

router.post("/v1/upload/editor", requireSignin, authMiddleware, uploadMediaFromEditor);

module.exports = router;
